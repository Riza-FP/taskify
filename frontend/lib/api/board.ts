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

// Update a board
export async function updateBoard(id: string, title?: string, description?: string) {
    const response = await apiFetch(`/boards/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, description }),
    });
    return response.data;
}

// Delete a board
export async function deleteBoard(id: string) {
    const response = await apiFetch(`/boards/${id}`, {
        method: "DELETE",
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

// Update a list
export async function updateList(id: number, title?: string, position?: number, boardId?: number) {
    const response = await apiFetch(`/lists/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, position, board_id: boardId }),
    });
    return response.data;
}

// Delete a list
export async function deleteList(id: number) {
    const response = await apiFetch(`/lists/${id}`, {
        method: "DELETE",
    });
    return response.data;
}

export interface BoardFetchFilters {
    search?: string;
    labels?: number[];     // comma-sep label IDs → ?labels=1,2,3
    sort?: "title" | "deadline"; // omit for default rank order
    ascending?: boolean;
}

// Fetch full board details including lists, tasks and labels — single call
export async function getBoardDetails(boardId: string, filters: BoardFetchFilters = {}): Promise<BoardData> {
    const params = new URLSearchParams();
    if (filters.search?.trim()) params.set("search", filters.search.trim());
    if (filters.labels?.length) params.set("labels", filters.labels.join(","));
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.ascending !== undefined) params.set("ascending", String(filters.ascending));

    const qs = params.toString();
    const response = await apiFetch(`/boards/${boardId}${qs ? `?${qs}` : ""}`);
    const board = response.data;

    const rawLists: any[] = board.lists || [];

    const columns: Column[] = rawLists
        .map((list: any) => ({
            id: list.id.toString(),
            title: list.title,
            idx: list.position ?? list.rank ?? 0,
        }))
        .sort((a, b) => a.idx - b.idx);

    const allTasks: Task[] = rawLists.flatMap((list: any) =>
        (list.tasks || []).map((t: any) => ({
            id: t.id.toString(),
            title: t.title,
            description: t.description || undefined,
            columnId: list.id,
            labels: (t.labels || []).map((l: any) => ({
                id: l.id.toString(),
                name: l.title,   // backend uses "title", frontend uses "name"
                color: l.color,
            })),
            dueDate: t.deadline ? new Date(t.deadline).toISOString() : undefined,
            rank: t.rank ?? t.position,
        }))
    );

    return { columns, tasks: allTasks };
}
