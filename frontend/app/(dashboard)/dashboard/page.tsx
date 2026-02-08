"use client";

import { KanbanBoard } from "@/components/board/KanbanBoard";
import { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { fetchBoardData } from "@/store/slices/boardSlice";
import { getBoards, createBoard, createList } from "@/lib/api/board";

export default function DashboardPage() {
  const [status, setStatus] = useState("Loading workspace...");
  const [boardId, setBoardId] = useState<string>("");
  const dispatch = useAppDispatch();

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initBoard = async () => {
      try {
        // 1. Fetch available boards
        const boards = await getBoards();

        if (boards && boards.length > 0) {
          // 2. Load the first board found
          setBoardId(boards[0].id.toString());
          setStatus(`Loading board: ${boards[0].title}...`);
          const action = await dispatch(fetchBoardData(boards[0].id));

          if (fetchBoardData.fulfilled.match(action)) {
            const boardData = action.payload;
            if (boardData.columns.length === 0) {
              setStatus("Board empty. Initializing default lists...");
              const boardId = boards[0].id.toString();
              await createList(boardId, "Todo", 0);
              await createList(boardId, "In Progress", 1);
              await createList(boardId, "Done", 2);
              // Reload
              dispatch(fetchBoardData(boards[0].id));
            }
          }
        } else {
          // 3. If no boards, create a default one
          setStatus("Creating your first board...");
          const newBoard = await createBoard(
            "General",
            "My first project board",
          );

          if (newBoard) {
            setBoardId(newBoard.id.toString());
            setStatus("Initializing default lists...");
            const boardId = newBoard.id.toString();
            // Create default lists
            await createList(boardId, "Todo", 0);
            await createList(boardId, "In Progress", 1);
            await createList(boardId, "Done", 2);

            dispatch(fetchBoardData(newBoard.id));
          }
        }
        setStatus("Workspace Ready");
      } catch (error) {
        console.error("Failed to initialize board:", error);
        setStatus("Failed to load workspace.");
        // Optionally redirect to login if 401
      }
    };

    initBoard();
  }, [dispatch]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          My Project Board
        </h1>

        <div className="flex items-center gap-2">
          {/* Status indicator for dev */}
          <span className="text-xs text-slate-400">{status}</span>
        </div>
      </div>

      {boardId && <KanbanBoard boardId={boardId} />}
    </div>
  );
}
