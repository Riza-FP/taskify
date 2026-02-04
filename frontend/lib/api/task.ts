import { apiFetch } from "./client";

export async function createTask(listId: string | number, title: string, description?: string, priority?: string) {
    const response = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
            list_id: Number(listId),
            title,
            description,
            position: 9999, // Append to end by default
            // priority - backend might not support it yet based on controller analysis, but passing it just in case or handling it later
        }),
    });
    return response.data;
}

export async function updateTask(taskId: string, updates: any) {
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
