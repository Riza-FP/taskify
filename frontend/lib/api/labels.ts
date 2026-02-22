import { apiFetch } from "./client";
import { Label } from "../types";

// Map backend label shape (title) → frontend Label (name)
function mapLabel(raw: any): Label {
    return {
        id: raw.id.toString(),
        name: raw.title,
        color: raw.color,
    };
}

// GET /labels?search=<query>  — fetch all labels, optionally filtered by name
export async function getLabels(search?: string): Promise<Label[]> {
    const qs = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
    const response = await apiFetch(`/labels${qs}`);
    return (response.data || []).map(mapLabel);
}

// POST /labels — create a new label AND immediately link it to a task
// Backend creates the label and calls createLabelToTask in one shot.
export async function createLabel(title: string, color: string, taskId: string): Promise<Label> {
    const response = await apiFetch("/labels", {
        method: "POST",
        body: JSON.stringify({ title, color, taskId: Number(taskId) }),
    });
    return mapLabel(response.data);
}

// PUT /labels/:id — update a label's name / color
export async function updateLabel(id: string, title: string, color: string): Promise<Label> {
    const response = await apiFetch(`/labels/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, color }),
    });
    return mapLabel(response.data);
}

// DELETE /labels/:id — delete a label globally
export async function deleteLabel(id: string): Promise<void> {
    await apiFetch(`/labels/${id}`, { method: "DELETE" });
}

// POST /labels/toggle — attach or detach a label from a task (server decides based on current state)
export async function toggleLabel(taskId: string, labelId: string): Promise<void> {
    await apiFetch("/labels/toggle", {
        method: "POST",
        body: JSON.stringify({ taskId: Number(taskId), labelId: Number(labelId) }),
    });
}
