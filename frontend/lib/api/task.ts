import { Task } from "../types";
import { apiFetch } from "./client";

export async function createTask(listId: number, rank: string, title: string, description?: string) {
    const response = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
            list_id: listId,
            title,
            description,
            rank,
        }),
    });
    return response.data;
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
    const response = await apiFetch(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(updates),
    });
    return response.data;
}

export async function deleteTask(taskId: string) {
    const response = await apiFetch(`/tasks/${taskId}`, {
        method: "DELETE",
    });
    return response.data;
}
