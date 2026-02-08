import { apiFetch } from "./client";
import { BoardData, Column, Task } from "../types";

interface RawList {
    id: number;
    title: string;
    board_id: number;
    position: number;
}

interface RawTask {
    id: number;
    title: string;
    description: string | null;
    list_id: number;
    priority: string;
    deadline: string | null;
    rank: string;
}

// Fetch all boards for the current user
export async function getBoards() {
    const response = await apiFetch("/boards");
    return response.data;
}

// Create a new board
export async function createBoard(title: string, description?: string) {
    const response = await apiFetch("/boards", {
        method: "POST",
        body: JSON.stringify({ title, description }),
    });
    return response.data;
}

// Create a new list (column)
export async function createList(boardId: string, title: string, position: number) {
    const response = await apiFetch("/lists", {
        method: "POST",
        body: JSON.stringify({ board_id: boardId, title, position }),
    });
    return response.data;
}

// Fetch full board details including lists and tasks
export async function getBoardDetails(boardId: string): Promise<BoardData> {
    // 1. Fetch Lists
    const listsResponse = await apiFetch(`/boards/${boardId}/lists`);
    const lists: RawList[] = listsResponse.data || [];

    const columns: Column[] = [];
    let allTasks: Task[] = [];

    // 2. For each list, fetch its tasks
    await Promise.all(lists.map(async (list) => {
        const tasksResponse = await apiFetch(`/lists/${list.id}/tasks`);
        const tasks: RawTask[] = tasksResponse.data || [];

        // Map backend task to frontend Task type
        const mappedTasks: Task[] = tasks.map(t => ({
            id: t.id.toString(),
            title: t.title,
            list_id: list.id,
            description: t.description || undefined,
            columnId: list.id, // Map list_id to columnId
            tags: [],
            dueDate: t.deadline ? new Date(t.deadline).toISOString() : undefined,
            rank: t.rank
        }));

        allTasks = [...allTasks, ...mappedTasks];

        columns.push({
            id: list.id.toString(),
            title: list.title,
            idx: list.position || 0
        });
    }));

    const sortedColumns = columns.sort((a, b) => a.idx - b.idx);

    return {
        columns: sortedColumns,
        tasks: allTasks
    };
}
