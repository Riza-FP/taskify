"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { BoardFilter, FilterState } from "./BoardFilter";
import { Column, Task } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchBoardData, moveTaskAsync } from "@/store/slices/boardSlice";
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

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    labels: [],
    sortBy: "rank",
  });

  // Debounced server fetch when filters change
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch(
          fetchBoardData({
            boardId,
            filters: {
              search: newFilters.search,
              labels: newFilters.labels.map((l) => Number(l.id)),
              sort: newFilters.sortBy === "rank" ? undefined : newFilters.sortBy === "dueDate" ? "deadline" : newFilters.sortBy as "title" | "deadline",
              ascending: true,
            },
          })
        );
      }, 400);
    },
    [boardId, dispatch]
  );

  // Disable DnD when any filter is active (server re-ordered ranks on sort)
  const isDragDisabled =
    filters.search !== "" ||
    filters.labels.length > 0 ||
    filters.sortBy !== "rank";

  const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function onDragStart(event: DragStartEvent) {
    if (isDragDisabled) return;
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
    if (active.data.current?.type !== "Task") return;
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

      dispatch(moveTaskAsync({ taskId: activeTask.id, columnId: newListId, rank: newRank }));
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
        dispatch(moveTaskAsync({ taskId: activeTask.id, columnId: targetListId, rank: newRank }));
        return;
      }

      const prevRank = targetTasks[overIndex - 1]?.rank ?? null;
      const nextRank = targetTasks[overIndex]?.rank ?? null;
      const [newRank, ok] = lexorank.insert(prevRank, nextRank);
      if (!ok) return;

      dispatch(moveTaskAsync({ taskId: activeTask.id, columnId: targetListId, rank: newRank }));
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
        {/* Filter Bar */}
        <div className="px-4 md:px-0">
          <BoardFilter filters={filters} onFilterChange={handleFilterChange} />
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
                      (task) => task.columnId === Number(activeColumn.id)
                    )}
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
