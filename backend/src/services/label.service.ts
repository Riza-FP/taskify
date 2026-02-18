import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../database.types.js";
import type { CreateLabelDTO, Label, UpdateLabelDTO } from "../types/label.type.js";
import { supabase } from "../lib/supabase.js";
import { NotFoundError } from "../utils/errors.js";

export async function createLabel(supabase: SupabaseClient<Database>, req: CreateLabelDTO): Promise<Label> {
    const { data, error } = await supabase.from("labels").insert({
        title: req.title,
        task_id: req.task_id,
        color: req.color,
    }).select().single();

    if (error) throw error;

    return data!;
}

export async function updateLabel(supabase: SupabaseClient<Database>, req: UpdateLabelDTO): Promise<Label> {

    const { data, error } = await supabase.from("labels").update({
        task_id: req.task_id,
        title: req.title,
        color: req.color,
    }).eq("id", req.id).select().single();

    if (error) throw error;
    return data!;
}

export async function deleteLabel(supabase: SupabaseClient<Database>, id: number): Promise<Label> {
    const { data, error } = await supabase.from("labels").delete().eq("id", id).select().single();
    if (error) throw error;
    return data!;
}

export async function getLabelById(supabase: SupabaseClient<Database>, id: number): Promise<Label> {
    const { data, error } = await supabase.from("labels").select().eq("id", id).maybeSingle();
    if (error) throw error;

    if (!data) throw new NotFoundError("Label not found");

    return data;
}

export async function searchLabelByTitle(supabase: SupabaseClient<Database>, title: string | null, taskId: number | null, boardId: number | null): Promise<Label[]> {
    let builder = supabase
        .from("labels")
        .select(`
            *,
            tasks!inner (
                id,
                lists!inner (
                    id,
                    board_id
                )
            )
        `);

    if (title) {
        builder = builder.ilike("title", `%${title}%`);
    }

    if (taskId) {
        builder = builder.eq("task_id", taskId);
    }

    if (boardId) {
        builder = builder.eq("tasks.lists.board_id", boardId);
    }

    const { data, error } = await builder;

    if (error) throw error;

    return data || [];
}

export async function getAllLabelByTaskId(supabase: SupabaseClient<Database>, task_id: number): Promise<Label[]> {
    const { data, error } = await supabase.from("labels").select().eq("task_id", task_id).order("created_at", { ascending: true });

    if (error) throw error;

    return data!;
}

