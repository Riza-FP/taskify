import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../database.types.js";
import { AuthenticationError } from "../utils/errors.js";
import type { Notification } from "../types/notification.type.js";

export async function updateNotificationSetting(supabase: SupabaseClient<Database>, days: number) {
    const { data, error: uError } = await supabase.auth.getUser();
    if (uError) throw uError;
    if (!data.user) throw new AuthenticationError("Action not allowed");

    // Use upsert so it works even if the row was never created on sign-up
    const { error } = await supabase.from("user_settings").upsert({
        user_id: data.user.id,
        notify_before_days: days,
    }, { onConflict: "user_id" });

    if (error) throw error;
}


export async function selectNotificationSetting(supabase: SupabaseClient<Database>) {
    const { data, error: uError } = await supabase.auth.getUser();
    if (uError) throw uError;
    if (!data.user) throw new AuthenticationError("Action not allowed");

    const { data: sData, error } = await supabase
        .from("user_settings")
        .select()
        .eq("user_id", data.user.id)
        .maybeSingle(); // returns null instead of throwing when 0 rows

    if (error) throw error;

    // If no row exists yet (legacy user before sign-up hook), return default
    if (!sData) {
        // Also create the missing row so subsequent calls succeed
        await supabase.from("user_settings").insert({
            user_id: data.user.id,
            notify_before_days: 1,
        });
        return { user_id: data.user.id, notify_before_days: 1 };
    }

    return sData;
}


export async function markNotificationAsSeen(supabase: SupabaseClient<Database>, id: number): Promise<Notification> {
    const { data, error } = await supabase.from("notifications").update({
        is_seen: true,
    }).select().eq("id", id).single();

    if (error) throw error;
    if (!data) throw new Error("Notification not found");

    return data;
}

export async function getAllNotifications(supabase: SupabaseClient<Database>): Promise<Notification[]> {
    const { data, error } = await supabase.from("notifications").select();
    if (error) throw error;
    return data || [];
}
