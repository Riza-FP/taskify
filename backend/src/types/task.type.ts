import type { Tables } from "../../database.types.js";

export type Task = Tables<"tasks">;

export type CreateTaskDTO = {
    list_id: number;
    rank: string;
    title: string;
    description?: string;
    deadline?: string; // ISO Date string
}

export type UpdateTaskDTO = {
    id: number;
    list_id: number;
    rank: string;
    title: string;
    description: string;
    deadline: string;
}

