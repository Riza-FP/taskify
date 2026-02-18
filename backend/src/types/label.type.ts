import type { Tables } from "../../database.types.js";

export type Label = Tables<"labels">;

export type CreateLabelDTO = {
    task_id: number;
    title: string;
    color: string;
}

export type UpdateLabelDTO = {
    id: number;
    task_id: number;
    title: string;
    color: string;
}

