import type { SupabaseClient } from "@supabase/supabase-js";
import type { Board, BoardWithDetails, CreateBoardDTO, UpdateBoardDTO } from "../types/board.type.js";
import type { Database } from "../../database.types.js";
import { NotFoundError } from "../utils/errors.js";
import type { SortFilter } from "../types/filter.type.js";
import { Lexorank } from "../lib/lexorank.js";

export async function createBoard(supabase: SupabaseClient<Database>, req: CreateBoardDTO): Promise<Board> {

    const { data, error } = await supabase.from("boards").insert({
        title: req.title,
        user_id: req.user_id,
        description: req.description ?? null,
    }).select().single();

    if (error) throw error;

    return data!;
}

export async function updateBoard(supabase: SupabaseClient<Database>, req: UpdateBoardDTO): Promise<Board> {

    const { data, error } = await supabase.from("boards").update({
        title: req.title,
        user_id: req.user_id,
        description: req.description ?? null,
    }).eq("id", req.id).select().single();

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


export async function getBoardById(
    supabase: SupabaseClient<Database>,
    board_id: number,
    taskSearch: string = "",
    labelIds: number[] = [],
    sort: SortFilter | undefined = undefined,
): Promise<BoardWithDetails> {
    const labelFilterPath = labelIds.length > 0 ? 'task_labels!inner(label_id)' : 'task_labels(label_id)';
    let query = supabase
        .from("boards")
        .select(`
          *,
          lists (
            *,
            rank:position,
            tasks (
              *,
              rank:position,
              filter_labels:${labelFilterPath},
              labels:task_labels (
                ...labels (*)
              )
            )
          )
        `)
        .eq("id", board_id);

    if (taskSearch.trim()) {
        query = query.ilike('lists.tasks.title', `%${taskSearch}%`);
    }
    if (labelIds.length > 0) {
        query = query.in('lists.tasks.filter_labels.label_id', labelIds);
    }

    const allowedSortColumns: Record<string, string> = {
        title: 'title',
        deadline: 'deadline',
    };

    const taskSortColumn = (sort?.column && allowedSortColumns[sort.column])
        ? allowedSortColumns[sort.column]!
        : 'position';

    const now = new Date().toISOString();
    if (sort?.column === "deadline") {
        query = query.gte('lists.tasks.deadline', now);
    }

    const result = await query
        .order('position', { referencedTable: 'lists', ascending: true })
        .order(taskSortColumn, { referencedTable: 'lists.tasks', ascending: true, nullsFirst: false })
        .order('title', { referencedTable: 'lists.tasks.labels.labels', ascending: true })
        .maybeSingle();

    if (result.error) throw result.error;
    if (!result.data) throw new NotFoundError("Board not found");

    if (sort && result.data.lists) {
        const lexo = new Lexorank();

        for (const list of result.data.lists as any[]) {
            const tasks: any[] = list.tasks ?? [];
            if (tasks.length === 0) continue;

            const getCol = (task: any) => (task as Record<string, unknown>)[sort.column];
            const allNull = tasks.every((task) => getCol(task) == null);
            if (allNull) continue;

            // Fetch ALL tasks in this list to safely clear the entire position space
            const { data: allTasks, error: allTasksError } = await supabase
                .from("tasks")
                .select("id, position")
                .eq("list_id", list.id)
                .order("position", { ascending: true });
            if (allTasksError) throw allTasksError;
            if (!allTasks || allTasks.length === 0) continue;

            const [withValue, withoutValue] = tasks.reduce<[any[], any[]]>(
                ([a, b], task) => getCol(task) != null ? [[...a, task], b] : [a, [...b, task]],
                [[], []]
            );
            const orderedVisible = [...withValue, ...withoutValue];

            // Step 1: Clear ALL tasks in the list to guaranteed-unique tmp positions
            const clearResults = await Promise.all(
                allTasks.map((task) =>
                    supabase
                        .from("tasks")
                        .update({ position: `tmp_${task.id}_${Date.now()}` })
                        .eq("id", task.id)
                )
            );
            const clearError = clearResults.find(r => r.error)?.error;
            if (clearError) throw clearError;

            // Step 2: Assign new Lexoranks to visible (filtered) tasks first
            let prevRank: string | null = null;
            for (const task of orderedVisible) {
                const [newRank] = lexo.insert(prevRank, null);
                prevRank = newRank;
                task.rank = newRank;
                task.position = newRank;
                const { error } = await supabase
                    .from("tasks")
                    .update({ position: newRank })
                    .eq("id", task.id);
                if (error) throw error;
            }

            // Step 3: Assign remaining Lexoranks to hidden tasks (e.g. past-deadline ones)
            // so they still have valid, non-colliding positions in the DB
            const visibleIds = new Set(orderedVisible.map((t: any) => t.id));
            const hiddenTasks = allTasks.filter(t => !visibleIds.has(t.id));
            for (const task of hiddenTasks) {
                const [newRank] = lexo.insert(prevRank, null);
                prevRank = newRank;
                const { error } = await supabase
                    .from("tasks")
                    .update({ position: newRank })
                    .eq("id", task.id);
                if (error) throw error;
            }

            // Step 4: Re-sort visible tasks in-place for FE response
            tasks.sort((a, b) => {
                const aVal = getCol(a);
                const bVal = getCol(b);
                if (aVal == null) return 1;
                if (bVal == null) return -1;
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            });
        }
    }

    if (result.data.lists) {
        (result.data.lists as any[]).forEach((list) => {
            list.tasks?.forEach((task: any) => {
                delete task.filter_labels;
            });
        });
    }

    return result.data as unknown as BoardWithDetails;
}






export async function deleteBoard(supabase: SupabaseClient<Database>, id: number): Promise<Board> {
    const { data, error } = await supabase.from("boards").delete().eq("id", id).select().single();

    if (error) throw error;
    return data;
}
