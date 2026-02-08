"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calendar, MoreHorizontal } from "lucide-react";

interface TaskCardProps {
  task: Task;
  index?: number;
  onClick?: () => void;
}

export function TaskCard({ task, onClick, index }: TaskCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
      ...(index !== undefined ? { index } : {}),
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
        className="relative h-37.5 w-full cursor-grab rounded-2xl border-2 border-indigo-500/20 bg-indigo-50/50 p-4 opacity-50 ring-2 ring-indigo-500"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative flex cursor-grab flex-col gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-lg active:cursor-grabbing",
        isDragging
          ? "opacity-30 rotate-2 scale-105 shadow-xl ring-2 ring-indigo-500"
          : "hover:border-indigo-200",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 w-full">
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => {
              let colors = "bg-slate-100 text-slate-600";
              if (tag === "High" || tag === "Urgent")
                colors = "bg-rose-50 text-rose-600 ring-1 ring-rose-200";
              if (tag === "Medium")
                colors =
                  "bg-amber-50 text-amber-600 ring-1 ring-amber-200 ring-offset-0";
              if (tag === "Low")
                colors =
                  "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200";

              return (
                <span
                  key={tag}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide",
                    colors,
                  )}
                >
                  {tag}
                </span>
              );
            })}
          </div>

          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-800 line-clamp-2 leading-tight">
              {task.title}
            </h3>
            <button className="text-slate-400 opacity-0 transition-opacity hover:text-slate-600 group-hover:opacity-100 shrink-0">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end border-t border-slate-100 pt-3">
        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
            <Calendar size={12} />
            <span>Oct 24</span>
          </div>
        )}
      </div>
    </div>
  );
}
