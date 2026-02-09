"use client";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { deleteListAsync, updateListAsync } from "@/store/slices/boardSlice";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X } from "lucide-react";

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  createTask?: () => void;
}

export function BoardColumn({
  column,
  tasks,
  onTaskClick,
  createTask,
}: BoardColumnProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [title, setTitle] = useState(column.title);

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

  // Sync internal state with prop
  // This ensures optimistic updates or server updates are reflected
  useMemo(() => {
    setTitle(column.title);
  }, [column.title]);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDeleteList = () => {
    // Fire and forget - Redux handles optimistic update
    dispatch(deleteListAsync(Number(column.id)));
    toast.success("List deleted");
  };

  const handleUpdateTitle = () => {
    if (title.trim() === column.title) {
      setIsEditing(false);
      return;
    }

    // Fire and forget - Redux handles optimistic update
    dispatch(updateListAsync({ id: Number(column.id), title }));
    toast.success("List renamed");
    setIsEditing(false);
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

  const isDefaultList = ["Todo", "In Progress", "Done"].includes(column.title);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex h-fit md:h-full w-full md:w-80 shrink-0 flex-col gap-4 rounded-3xl bg-slate-50/50 p-2 ring-1 ring-slate-200/50 md:snap-center"
    >
      <div className="flex items-center justify-between px-2 py-1">
        <div
          {...attributes}
          {...listeners}
          className="flex flex-1 cursor-grab items-center gap-2 rounded-xl py-1 transition-colors hover:bg-slate-100/50"
        >
          {isEditing ? (
            <div className="flex w-full items-center gap-1">
              <input
                autoFocus
                className="bg-white/50 rounded-md px-1 py-0.5 font-bold text-slate-700 outline-none w-full ring-2 ring-indigo-500/20"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateTitle();
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setTitle(column.title);
                  }
                }}
                onMouseDown={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleUpdateTitle}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-700 hover:bg-green-200"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setTitle(column.title);
                }}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-100 text-red-700 hover:bg-red-200"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <h3 className="font-bold text-slate-700">
              {column.title}
            </h3>
          )}

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700 hover:shadow-sm transition-all outline-none">
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>List Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (isDefaultList) {
                    toast.error("Cannot rename default lists");
                    return;
                  }
                  setIsEditing(true);
                }}
                disabled={isDefaultList}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (isDefaultList) {
                    toast.error("Cannot delete default lists");
                    return;
                  }
                  setShowDeleteDialog(true);
                }}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                disabled={isDefaultList}
              >
                Delete List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the list "{column.title}" and all of its tasks. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteList}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 md:overflow-y-auto px-1 pb-4 scrollbar-hide">
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
