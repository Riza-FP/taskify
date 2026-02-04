import type { Tables } from "../../database.types.js";
import type { QueryData } from '@supabase/supabase-js';
import { supabase } from "../lib/supabase.js";


export type CreateBoardDTO = {
    user_id: string;
    title: string;
    description?: string;
}


export type Board = Tables<"boards">;



const boardQuery = supabase
    .from("boards")
    .select(`
    *,
    lists (
      *,
      tasks (*)
    )
  `).maybeSingle();

export type BoardWithDetails = QueryData<typeof boardQuery>;
