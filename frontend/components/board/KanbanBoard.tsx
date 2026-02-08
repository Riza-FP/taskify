'use client';

import { useMemo, useState, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    useSensors,
    useSensor,
    PointerSensor,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    closestCorners,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from './TaskCard';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateTaskModal } from './CreateTaskModal';
import { CreateListModal } from './CreateListModal';
import { Column, Task } from '@/lib/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { moveTaskAsync, reorderTaskAsync } from '@/store/slices/boardSlice';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
    boardId: string;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
    const dispatch = useAppDispatch();
    const { columns, tasks } = useAppSelector((state) => state.board.data);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createListModalOpen, setCreateListModalOpen] = useState(false);
    const [createColumnId, setCreateColumnId] = useState<string | null>(null);

    const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === 'Column') {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === 'Task') {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        // We only care if we are dragging a task
        if (active.data.current?.type !== 'Task') return;

        const isActiveTask = active.data.current?.type === 'Task';
        // const isOverTask = over.data.current?.type === 'Task'; // Unused
        // const isOverColumn = over.data.current?.type === 'Column'; // Unused

        if (!isActiveTask) return;
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const isActiveTask = active.data.current?.type === 'Task';

        if (isActiveTask) {
            // Find the task and the container it was dropped into
            const activeTask = tasks.find(t => t.id === activeId);

            // If dropped over a column
            if (over.data.current?.type === 'Column') {
                const newStatus = over.id as string;
                if (activeTask && activeTask.columnId !== newStatus) {
                    dispatch(moveTaskAsync({ taskId: activeId as string, newStatus }));
                }
            }
            // If dropped over another task
            else if (over.data.current?.type === 'Task') {
                const overTask = tasks.find(t => t.id === overId);
                if (activeTask && overTask) {
                    if (activeTask.columnId !== overTask.columnId) {
                        // Moving to different column
                        dispatch(moveTaskAsync({ taskId: activeId as string, newStatus: overTask.columnId }));
                    } else {
                        // Reordering in same column
                        const columnTasks = tasks.filter(t => t.columnId === activeTask.columnId).sort((a, b) => (a.position - b.position));
                        const oldColIndex = columnTasks.findIndex(t => t.id === activeId);
                        const newColIndex = columnTasks.findIndex(t => t.id === overId);

                        if (oldColIndex !== newColIndex) {
                            const reordered = arrayMove(columnTasks, oldColIndex, newColIndex);
                            const prev = reordered[newColIndex - 1];
                            const next = reordered[newColIndex + 1];

                            let newPos = 0;
                            if (!prev && !next) newPos = 1; // Only item?
                            else if (!prev) newPos = next.position / 2; // Start
                            else if (!next) newPos = prev.position + 1; // End
                            else newPos = (prev.position + next.position) / 2; // Middle

                            dispatch(reorderTaskAsync({ taskId: activeId as string, position: newPos }));
                        }
                    }
                }
            }
        }
    }

    function onTaskClick(task: Task) {
        setSelectedTask(task);
    }

    function handleCreateTask(columnId: string) {
        setCreateColumnId(columnId);
        setCreateModalOpen(true);
    }

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <>
            <div className="flex h-full w-full gap-6 overflow-x-auto pb-4 pt-2">
                <DndContext
                    sensors={sensors}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    collisionDetection={closestCorners}
                >
                    <div className="flex gap-6">
                        <SortableContext items={columnIds}>
                            {columns.map((col) => (
                                <BoardColumn
                                    key={col.id}
                                    column={col}
                                    tasks={tasks
                                        .filter((task) => task.columnId === col.id)
                                        .sort((a, b) => (a.position - b.position))
                                    }
                                    createTask={() => handleCreateTask(col.id)}
                                    onTaskClick={onTaskClick}
                                />
                            ))}
                        </SortableContext>

                        <button
                            onClick={() => setCreateListModalOpen(true)}
                            className="flex h-[50px] w-80 shrink-0 items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-4 font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                        >
                            <Plus size={20} />
                            Add another list
                        </button>
                    </div>

                    {createPortal(
                        <DragOverlay>
                            {activeColumn && (
                                <BoardColumn
                                    column={activeColumn}
                                    tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                                    createTask={() => { }}
                                    onTaskClick={() => { }}
                                />
                            )}
                            {activeTask && <TaskCard task={activeTask} />}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>

            <TaskDetailModal
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
            />

            <CreateTaskModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                columnId={createColumnId}
            />

            <CreateListModal
                isOpen={createListModalOpen}
                onClose={() => setCreateListModalOpen(false)}
                boardId={boardId}
                position={columns.length}
            />
        </>
    );
}
