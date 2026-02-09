import { Task } from "../types";
import { apiFetch } from "./client";

export async function createTask(listId: number, rank: string, title: string, description?: string, deadline?: string) {
    const response = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
            list_id: listId,
            title,
            description,
            rank,
            deadline,
        }),
    });
    return response.data;
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
    // Map frontend dueDate to backend deadline
    const { dueDate, ...rest } = updates;
    const payload = {
        ...rest,
        // If we explicitly want to set it to null (remove), we need to check if key exists
        ...("dueDate" in updates ? { deadline: dueDate } : {}),
    };

    const response = await apiFetch(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    return response.data;
}

export async function deleteTask(taskId: string) {
    const response = await apiFetch(`/tasks/${taskId}`, {
        method: "DELETE",
    });
    return response.data;
}
