"use client";

import { useMemo, useState } from "react";
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
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { BoardColumn } from "./BoardColumn";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { CreateTaskModal } from "./CreateTaskModal";
import { CreateListModal } from "./CreateListModal";
import { Column, Task } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { moveTaskAsync } from "@/store/slices/boardSlice";
import { Plus } from "lucide-react";
import { compareLexorank, Lexorank } from "@/lib/lexorank";

interface KanbanBoardProps {
  boardId: string;
}

const lexorank = new Lexorank();

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const { columns, tasks } = useAppSelector((state) => state.board.data);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createListModalOpen, setCreateListModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<number | null>(null);

  const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    // We only care if we are dragging a task
    if (active.data.current?.type !== "Task") return;

    const isActiveTask = active.data.current?.type === "Task";
    // const isOverTask = over.data.current?.type === 'Task'; // Unused
    // const isOverColumn = over.data.current?.type === 'Column'; // Unused

    if (!isActiveTask) return;
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    if (active.data.current?.type !== "Task") return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    /** =========================
     *  DROP ON COLUMN (empty space)
     *  ========================= */
    if (over.data.current?.type === "Column") {
      const newListId = Number(over.id);
      if (newListId === activeTask.columnId) return;

      const targetTasks = tasks
        .filter((t) => t.columnId === newListId && t.id !== activeTask.id)
        .sort((a, b) => compareLexorank(a.rank, b.rank));

      const lastRank = targetTasks.at(-1)?.rank ?? null;
      const [newRank, ok] = lexorank.insert(lastRank, null);
      if (!ok) return;

      dispatch(
        moveTaskAsync({
          taskId: activeTask.id,
          columnId: newListId,
          rank: newRank,
        }),
      );
      return;
    }

    /** =========================
     *  DROP ON TASK
     *  ========================= */
    if (over.data.current?.type === "Task") {
      const overTask = tasks.find((t) => t.id === over.id);
      if (!overTask) return;

      const targetListId = overTask.columnId;

      const targetTasks = tasks
        .filter((t) => t.columnId === targetListId && t.id !== activeTask.id)
        .sort((a, b) => compareLexorank(a.rank, b.rank));

      const overIndex = targetTasks.findIndex((t) => t.id === overTask.id);
      const isLast = overIndex === targetTasks.length - 1;

      // 👇 append instead of insert-before
      if (isLast) {
        const lastRank = targetTasks.at(-1)?.rank ?? null;
        const [newRank, ok] = lexorank.insert(lastRank, null);
        if (!ok) return;

        dispatch(
          moveTaskAsync({
            taskId: activeTask.id,
            columnId: targetListId,
            rank: newRank,
          }),
        );
        return;
      }

      // normal insert-between
      const prevRank = targetTasks[overIndex - 1]?.rank ?? null;
      const nextRank = targetTasks[overIndex]?.rank ?? null;

      const [newRank, ok] = lexorank.insert(prevRank, nextRank);
      if (!ok) return;

      dispatch(
        moveTaskAsync({
          taskId: activeTask.id,
          columnId: targetListId,
          rank: newRank,
        }),
      );
    }
  }

  function onTaskClick(task: Task) {
    setSelectedTask(task);
  }

  function handleCreateTask(columnId: number) {
    setCreateColumnId(columnId);
    setCreateModalOpen(true);
  }

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
                    .filter((task) => task.columnId === Number(col.id))
                    .sort((a, b) => compareLexorank(a.rank, b.rank))}
                  createTask={() => handleCreateTask(Number(col.id))}
                  onTaskClick={onTaskClick}
                />
              ))}
            </SortableContext>

            <button
              onClick={() => setCreateListModalOpen(true)}
              className="flex h-12.5 w-80 shrink-0 items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-4 font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
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
                  tasks={tasks.filter(
                    (task) => task.columnId === Number(activeColumn.id),
                  )}
                  createTask={() => {}}
                  onTaskClick={() => {}}
                />
              )}
              {activeTask && <TaskCard task={activeTask} />}
            </DragOverlay>,
            document.body,
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
        columnId={createColumnId || 0}
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
