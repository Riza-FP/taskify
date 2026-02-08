"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTaskAsync, selectTasksByListId } from "@/store/slices/boardSlice";
import { toast } from "sonner";
import { Lexorank } from "@/lib/lexorank";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnId: number;
}

const lexorank = new Lexorank();

export function CreateTaskModal({
  isOpen,
  onClose,
  columnId,
}: CreateTaskModalProps) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectTasksByListId(columnId));

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !columnId) return;

    setLoading(true);
    try {
      // TODO: handle re-indexing later
      const lastRank = tasks.at(-1)?.rank ?? null;
      const [rank] = lexorank.insert(lastRank, null);

      await dispatch(
        addTaskAsync({
          listId: columnId,
          rank,
          title,
          description,
        }),
      ).unwrap();
      toast.success("Task created successfully");
      setTitle("");
      setDescription("");
      onClose();
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              id="title"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Textarea
              id="description"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
