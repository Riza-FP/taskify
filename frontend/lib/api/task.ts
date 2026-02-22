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
    // Map frontend fields to backend fields
    const { dueDate, columnId, labels, ...rest } = updates;
    const payload = {
        ...rest,
        ...("dueDate" in updates ? { deadline: dueDate } : {}),
        ...("columnId" in updates ? { list_id: columnId } : {}),
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
