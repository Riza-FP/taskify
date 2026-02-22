"use client";

import { useNotifications } from "@/hooks/useNotifications";

/** 
 * Thin client-side wrapper that mounts the Supabase realtime
 * notifications subscription. Drop this anywhere inside the
 * dashboard layout tree.
 */
export function NotificationsListener() {
    useNotifications();
    return null;
}
