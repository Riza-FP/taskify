"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { fetchBoardData } from "@/store/slices/boardSlice";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { BoardHeader } from "@/components/board/BoardHeader";

export default function BoardPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const boardId = params.boardId as string;
    const [title, setTitle] = useState("Loading...");
    const [loading, setLoading] = useState(true);

    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const loadBoard = async () => {
            try {
                await dispatch(fetchBoardData({ boardId })).unwrap();

                // TODO: Optimize this by having a specific getBoard endpoint or storing Board metadata in Redux
                const response = await import("@/lib/api/board").then(m => m.getBoards());
                const currentBoard = response?.find((b: { id: number }) => b.id.toString() === boardId);
                if (currentBoard) {
                    setTitle(currentBoard.title);
                } else {
                    setTitle("Board Not Found");
                }

                setLoading(false);
            } catch (error) {
                console.error("Failed to load board", error);
                setTitle("Error loading board");
                setLoading(false);
            }
        };

        loadBoard();
    }, [boardId, dispatch]);

    if (loading) {
        return <div className="p-8 text-slate-500">Loading board...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <BoardHeader boardId={boardId} title={title} />
            <div className="flex-1 overflow-hidden">
                <KanbanBoard boardId={boardId} />
            </div>
        </div>
    );
}
