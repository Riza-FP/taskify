"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { MoreHorizontal, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

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
import { updateBoard, deleteBoard } from "@/lib/api/board";
import { BoardData } from "@/lib/types";
import { setBoardData } from "@/store/slices/boardSlice";

interface BoardHeaderProps {
    boardId: string;
    title: string;
    className?: string;
}

export function BoardHeader({ boardId, title: initialTitle, className }: BoardHeaderProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState(initialTitle);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [newTitle, setNewTitle] = useState(initialTitle);

    const handleRename = async () => {
        if (!newTitle.trim() || newTitle === title) {
            setIsEditing(false);
            setNewTitle(title);
            return;
        }

        try {
            await updateBoard(boardId, newTitle);
            setTitle(newTitle);
            toast.success("Board renamed successfully");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to rename board");
            setNewTitle(title);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteBoard(boardId);
            toast.success("Board deleted");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to delete board");
        }
    };

    return (
        <div className={`flex items-center gap-4 px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-slate-200/60 ${className}`}>
            <div className="flex items-center gap-4">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <input
                            autoFocus
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="text-2xl font-bold bg-white px-2 py-1 rounded-md border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename();
                                if (e.key === "Escape") {
                                    setIsEditing(false);
                                    setNewTitle(title);
                                }
                            }}
                        />
                        <button
                            onClick={handleRename}
                            className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        >
                            <Check size={20} />
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setNewTitle(title);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {title}
                    </h1>
                )}
            </div>

            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors outline-none">
                            <MoreHorizontal size={20} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Board Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename Board
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setShowDeleteDialog(true)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Board
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this board?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete "{title}" and all its lists and tasks. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
