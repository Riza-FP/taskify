"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  useSensors,
  useSensor,
  MouseSensor,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
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

import { BoardFilter, FilterState } from "./BoardFilter";

const lexorank = new Lexorank();

// ... existing imports

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const { columns, tasks } = useAppSelector((state) => state.board.data);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createListModalOpen, setCreateListModalOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<number | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    labels: [],
    sortBy: "rank",
  });

  const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    // ... existing sensors
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Derived filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesDesc = task.description?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 2. Label Filter
      if (filters.labels.length > 0) {
        const taskLabelIds = task.labels?.map((l) => l.id) || [];
        // Check if task has AT LEAST ONE of the selected labels
        const hasMatchingLabel = filters.labels.some((filterLabel) =>
          taskLabelIds.includes(filterLabel.id)
        );
        if (!hasMatchingLabel) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Check if we should disable Drag and Drop
  // We disable DnD if there are active filters or sorting is not by 'rank'
  const isDragDisabled =
    filters.search !== "" ||
    filters.labels.length > 0 ||
    filters.sortBy !== "rank";

  function onDragStart(event: DragStartEvent) {
    if (isDragDisabled) return; // Prevent drag if filtered

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

    // DROP ON COLUMN
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

    // DROP ON TASK
    if (over.data.current?.type === "Task") {
      const overTask = tasks.find((t) => t.id === over.id);
      if (!overTask) return;

      const targetListId = overTask.columnId;

      const targetTasks = tasks
        .filter((t) => t.columnId === targetListId && t.id !== activeTask.id)
        .sort((a, b) => compareLexorank(a.rank, b.rank));

      const overIndex = targetTasks.findIndex((t) => t.id === overTask.id);
      const isLast = overIndex === targetTasks.length - 1;

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
      <div className="flex flex-col h-full w-full">
        {/* Filter Component */}
        <div className="px-4 md:px-0">
          <BoardFilter filters={filters} onFilterChange={setFilters} />
        </div>

        <div className="flex h-full w-full flex-col md:flex-row gap-6 md:overflow-x-auto pb-4 pt-2 snap-y md:snap-x snap-mandatory">
          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            collisionDetection={closestCorners}
          >
            <div className="flex flex-col md:flex-row gap-6 w-full h-full">
              <SortableContext items={columnIds} disabled={isDragDisabled}>
                {columns.map((col) => (
                  <BoardColumn
                    key={col.id}
                    column={col}
                    tasks={filteredTasks
                      .filter((task) => task.columnId === Number(col.id))
                      .sort((a, b) => {
                        if (filters.sortBy === "rank") {
                          return compareLexorank(a.rank, b.rank);
                        }
                        if (filters.sortBy === "dueDate") {
                          if (!a.dueDate) return 1;
                          if (!b.dueDate) return -1;
                          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                        }
                        if (filters.sortBy === "title") {
                          return a.title.localeCompare(b.title);
                        }
                        return 0;
                      })}
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
                    createTask={() => { }}
                    onTaskClick={() => { }}
                  />
                )}
                {activeTask && <TaskCard task={activeTask} />}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>
        </div>
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
