"use client";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";
import { Plus, ArrowUpDown } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { getListTasks, ListSortOption } from "@/lib/api/list";
import { compareLexorank } from "@/lib/lexorank";

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  createTask?: () => void;
}

const SORT_LABELS: Record<ListSortOption | "rank", string> = {
  "rank": "Default (rank)",
  "title:asc": "Title A → Z",
  "title:desc": "Title Z → A",
  "created_at:asc": "Created (oldest first)",
  "created_at:desc": "Created (newest first)",
  "deadline:asc": "Deadline (earliest first)",
  "deadline:desc": "Deadline (latest first)",
};

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

  // Per-column sort state
  const [sortKey, setSortKey] = useState<ListSortOption | "rank">("rank");
  const [sortedTasks, setSortedTasks] = useState<Task[] | null>(null); // null = use prop tasks
  const [isSorting, setIsSorting] = useState(false);

  const handleSortChange = useCallback(
    async (value: string) => {
      const selected = value as ListSortOption | "rank";
      setSortKey(selected);

      if (selected === "rank") {
        setSortedTasks(null); // revert to default prop tasks (sorted by rank)
        return;
      }

      setIsSorting(true);
      try {
        const fetched = await getListTasks(column.id, selected);
        setSortedTasks(fetched);
      } catch {
        toast.error("Failed to sort tasks");
        setSortKey("rank");
        setSortedTasks(null);
      } finally {
        setIsSorting(false);
      }
    },
    [column.id]
  );

  // When tasks prop changes (e.g. new task added), re-apply sort
  const displayTasks = useMemo(() => {
    if (sortedTasks !== null) return sortedTasks;
    return [...tasks].sort((a, b) => compareLexorank(a.rank, b.rank));
  }, [tasks, sortedTasks]);

  const taskIds = useMemo(() => displayTasks.map((t) => t.id), [displayTasks]);

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

  useMemo(() => {
    setTitle(column.title);
  }, [column.title]);

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDeleteList = () => {
    dispatch(deleteListAsync(Number(column.id)));
    toast.success("List deleted");
  };

  const handleUpdateTitle = () => {
    if (title.trim() === column.title) {
      setIsEditing(false);
      return;
    }
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

  const DEFAULT_LIST_NAMES = ["todo", "to do", "in progress", "done"];
  const isDefaultList = DEFAULT_LIST_NAMES.includes(column.title.toLowerCase());
  const isSorted = sortKey !== "rank";

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
            {displayTasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Sort indicator */}
          {isSorted && (
            <div
              className="flex h-6 items-center gap-1 rounded-full bg-indigo-100 px-2 text-[10px] font-semibold text-indigo-600 cursor-pointer"
              onClick={() => handleSortChange("rank")}
              title="Click to clear sort"
            >
              <ArrowUpDown size={10} />
              {isSorting ? "…" : "sorted"}
            </div>
          )}

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

              {/* Sort submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort tasks
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={sortKey}
                    onValueChange={handleSortChange}
                  >
                    {(Object.keys(SORT_LABELS) as (ListSortOption | "rank")[]).map(
                      (key) => (
                        <DropdownMenuRadioItem key={key} value={key}>
                          {SORT_LABELS[key]}
                        </DropdownMenuRadioItem>
                      )
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {!isDefaultList && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    Delete List
                  </DropdownMenuItem>
                </>
              )}
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

      <div className={cn(
        "flex flex-1 flex-col gap-3 md:overflow-y-auto px-1 pb-4 scrollbar-hide",
        isSorting && "opacity-60 pointer-events-none"
      )}>
        <SortableContext items={taskIds} disabled={isSorted}>
          {displayTasks.map((task) => (
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
