import { apiFetch } from "./client";
import { Task } from "../types";

export type ListSortOption =
    | "title:asc"
    | "title:desc"
    | "created_at:asc"
    | "created_at:desc"
    | "deadline:asc"
    | "deadline:desc";

// GET /lists/:id/tasks?sort=[title|created_at|deadline]:[asc|desc]
export async function getListTasks(listId: string | number, sort?: ListSortOption): Promise<Task[]> {
    const qs = sort ? `?sort=${sort}` : "";
    const response = await apiFetch(`/lists/${listId}/tasks${qs}`);

    const raw: any[] = response.data || [];
    return raw.map((t: any) => ({
        id: t.id.toString(),
        title: t.title,
        description: t.description || undefined,
        columnId: Number(listId),
        labels: (t.labels || []).map((l: any) => ({
            id: l.id.toString(),
            name: l.title,
            color: l.color,
        })),
        dueDate: t.deadline ? new Date(t.deadline).toISOString() : undefined,
        rank: t.rank ?? t.position,
    }));
}
