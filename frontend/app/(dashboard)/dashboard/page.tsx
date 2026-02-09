"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Layout } from "lucide-react";
import { getBoards, createBoard, createList } from "@/lib/api/board";
import { toast } from "sonner";
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

interface Board {
  id: number;
  title: string;
  description: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [iscreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create Board Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadBoards = async () => {
    try {
      const data = await getBoards();
      setBoards(data || []);
    } catch (error) {
      toast.error("Failed to load boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleCreateBoard = async () => {
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const newBoard = await createBoard(newTitle, newDesc);
      if (newBoard) {
        // Create default lists for the new board
        const boardId = newBoard.id.toString();
        await createList(boardId, "Todo", 0);
        await createList(boardId, "In Progress", 1);
        await createList(boardId, "Done", 2);

        toast.success("Board created successfully");
        setIsCreateModalOpen(false);
        setNewTitle("");
        setNewDesc("");
        loadBoards(); // Refresh list or redirect
        router.push(`/board/${newBoard.id}`);
      }
    } catch (error) {
      toast.error("Failed to create board");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Loading your workspace...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Boards</h1>
          <p className="text-slate-500 mt-1">Select a project to start working or create a new one.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board) => (
          <Link
            key={board.id}
            href={`/board/${board.id}`}
            className="group relative flex flex-col h-40 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 hover:ring-2 hover:ring-indigo-500/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Layout size={20} />
              </div>
              <h3 className="font-bold text-lg text-slate-800">{board.title}</h3>
            </div>
            <p className="text-sm text-slate-500 line-clamp-2">
              {board.description || "No description"}
            </p>
          </Link>
        ))}

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex flex-col h-40 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 text-slate-500 transition-all hover:border-indigo-400 hover:bg-indigo-50/10 hover:text-indigo-600"
        >
          <Plus size={32} className="mb-2 opacity-50" />
          <span className="font-medium">Create New Board</span>
        </button>
      </div>

      <Dialog open={iscreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-slate-700">Board Title</label>
              <Input
                id="title"
                placeholder="e.g. Website Redesign"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="desc" className="text-sm font-medium text-slate-700">Description</label>
              <Textarea
                id="desc"
                placeholder="What is this project about?"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBoard} disabled={isCreating || !newTitle.trim()}>
              {isCreating ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
