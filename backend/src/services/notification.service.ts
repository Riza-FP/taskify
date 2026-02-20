import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../database.types.js";
import { AuthenticationError } from "../utils/errors.js";

export async function updateNotificationSetting(supabase: SupabaseClient<Database>, days: number) {
    const { data, error: uError } = await supabase.auth.getUser();

    if (uError) throw uError;

    if (!data.user) throw new AuthenticationError("Action not allowed");

    const { error } = await supabase.from("user_settings").update({
        notify_before_days: days,
    }).eq("user_id", data.user.id);

    if (error) throw error;
}


export async function selectNotificationSetting(supabase: SupabaseClient<Database>) {

    const { data, error: uError } = await supabase.auth.getUser();
    if (uError) throw uError;

    if (!data.user) throw new AuthenticationError("Action not allowed");

    const { data: sData, error } = await supabase.from("user_settings").select().eq("user_id", data.user.id).single();
    if (error) throw error;

    return sData;
}


