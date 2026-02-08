import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../database.types.js";
import type { CreateTaskDTO, Task, UpdateTaskDTO } from "../types/task.type.js";
import { NotFoundError } from "../utils/errors.js";

export async function createTask(supabase: SupabaseClient<Database>, req: CreateTaskDTO): Promise<Task> {

    const { data, error } = await supabase.from("tasks").insert({
        title: req.title,
        list_id: req.list_id,
        description: req.description ?? null,
        deadline: req.deadline ?? null,
        rank: req.rank,
    }).select().single();

    if (error) throw error;

    return data!;
}

export async function updateTask(supabase: SupabaseClient<Database>, req: UpdateTaskDTO): Promise<Task> {

    const { data, error } = await supabase.from("tasks").update({
        list_id: req.list_id,
        rank: req.rank,
        title: req.title,
        description: req.description,
        deadline: req.deadline,
    }).eq("id", req.id).select().single();

    if (error) throw error;
    return data!;
}

export async function deleteTask(supabase: SupabaseClient<Database>, id: number): Promise<Task> {
    const { data, error } = await supabase.from("tasks").delete().eq("id", id).select().single();
    if (error) throw error;
    return data!;
}


export async function getTaskById(supabase: SupabaseClient<Database>, id: number): Promise<Task> {
    const { data, error } = await supabase.from("tasks").select().eq("id", id).maybeSingle();
    if (error) throw error;

    if (!data) throw new NotFoundError("Task not found");

    return data;
}


export async function getAllTaskByListId(supabase: SupabaseClient<Database>, list_id: number): Promise<Task[]> {
    const { data, error } = await supabase.from("tasks").select().eq("list_id", list_id).order("rank", { ascending: true });

    if (error) throw error;

    return data!;
}
