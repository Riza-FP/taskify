"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { Task } from "@/lib/types";
import { useAppDispatch } from "@/store/hooks";
import { updateTaskAsync, deleteTaskAsync } from "@/store/slices/boardSlice";
import { Tag, AlignLeft, Calendar } from "lucide-react";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

import { LabelPicker } from "./LabelPicker";
import { Label } from "@/lib/types";

// ... existing imports

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
}: TaskDetailModalProps) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [labels, setLabels] = useState<Label[]>([]);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setLabels(task.labels || []);

      if (task.dueDate) {
        // Convert UTC ISO string to Local format for datetime-local input (YYYY-MM-DDTHH:mm)
        const d = new Date(task.dueDate);
        const offset = d.getTimezoneOffset() * 60000;
        const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
        setDeadline(localISOTime);
      } else {
        setDeadline("");
      }
    }
  }, [task]);

  const handleSave = () => {
    if (!task) return;
    dispatch(
      updateTaskAsync({
        id: task.id,
        changes: {
          title,
          description,
          labels,
          // Convert back to ISO string (UTC)
          dueDate: deadline ? new Date(deadline).toISOString() : undefined
        },
      }),
    );
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    dispatch(deleteTaskAsync(task.id));
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-full p-0 overflow-hidden gap-0 bg-white">
        <DialogTitle className="sr-only">Task Details</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-4 h-[80vh] md:h-150">
          {/* Main Content Area */}
          <div className="md:col-span-3 p-6 flex flex-col gap-6">
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold border-none shadow-none px-0 h-auto focus-visible:ring-0 placeholder:text-slate-400"
                  placeholder="Task title"
                />
              </div>

              {/* Labels Display (Main Area) */}
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {labels.map((label) => (
                    <span
                      key={label.id}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${label.color}`}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-6 flex-1">
              {/* Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-700 font-semibold px-1">
                  <AlignLeft size={18} />
                  <h3>Description</h3>
                </div>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a more detailed description..."
                  className="min-h-37.5 resize-none text-slate-700 bg-slate-50/50 border-slate-200 focus:bg-white transition-all shadow-none"
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 bg-slate-50 p-6 border-l border-slate-100 flex flex-col gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Add to card
                </span>
                <div className="flex flex-col gap-3 mt-2">
                  {/* Label Picker */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500">Labels</label>
                    <LabelPicker selectedLabels={labels} onChange={setLabels} />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500">Due Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Actions
                </span>
                <div className="flex flex-col gap-2 mt-2">
                  <Button
                    onClick={handleSave}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200"
                  >
                    Save Changes
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      >
                        Delete Task
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the task
                          <span className="font-semibold text-slate-900">
                            {" "}
                            &quot;{task.title}&quot;{" "}
                          </span>
                          and remove it from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
