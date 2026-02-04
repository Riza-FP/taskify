import type { SupabaseClient } from "@supabase/supabase-js";
import type { Board, BoardWithDetails, CreateBoardDTO } from "../types/board.type.js";
import type { Database } from "../../database.types.js";
import { NotFoundError } from "../utils/errors.js";


export async function createBoard(supabase: SupabaseClient<Database>, req: CreateBoardDTO): Promise<Board> {
    const { data, error } = await supabase.from("boards").insert({
        title: req.title,
        user_id: req.user_id,
        description: req.description ?? null,
    }).select().single();

    if (error) throw error;

    return data!;
}

export async function getAllBoards(supabase: SupabaseClient<Database>): Promise<Board[]> {
    const { data, error } = await supabase
        .from("boards")
        .select();

    if (error) throw error;

    return data;
}


export async function getBoardById(supabase: SupabaseClient<Database>, board_id: number): Promise<BoardWithDetails> {
    const { data, error } = await supabase
        .from("boards")
        .select(`
         *,
        lists (
            *,
           tasks (*)
          )
        `)
        .eq("id", board_id)
        .maybeSingle();

    if (error) throw error;

    if (!data) throw new NotFoundError("board not found");

    return data;
}
