"use client";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { MoreVertical, Plus } from "lucide-react";
import { useMemo } from "react";

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  deleteColumn?: () => void;
  updateColumn?: () => void;
  createTask?: () => void;
  deleteTask?: () => void;
  updateTask?: () => void;
}

export function BoardColumn({
  column,
  tasks,
  onTaskClick,
  createTask,
}: BoardColumnProps) {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex h-125 w-80 flex-col rounded-3xl border-2 border-indigo-500/20 bg-indigo-50/50 opacity-40 ring-4 ring-indigo-500/10"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex h-full w-80 shrink-0 flex-col gap-4 rounded-3xl bg-slate-50/50 p-2 ring-1 ring-slate-200/50"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-between rounded-xl px-2 py-1 transition-colors hover:bg-slate-100/50"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-700">{column.title}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200/60 px-1.5 text-xs font-bold text-slate-600">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={createTask}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-sm transition-all"
          >
            <Plus size={18} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-sm transition-all">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-1 pb-4 scrollbar-hide">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick?.(task)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
