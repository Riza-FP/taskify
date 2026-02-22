"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { markSeen } from "@/lib/api/notifications";

interface RealtimeNotification {
    id: number;
    text: string;
    is_seen: boolean;
}

/**
 * Subscribes to INSERT events on the `notifications` table via Supabase realtime.
 * Shows a toast for every new unseen notification row for the current user,
 * then immediately marks it as seen via the API.
 * (RLS on the notifications table ensures only the current user's rows are received.)
 *
 * Must be mounted after the user is authenticated (token in localStorage).
 */
export function useNotifications() {
    useEffect(() => {
        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;

        // Set the auth header on the realtime connection so RLS applies
        supabase.realtime.setAuth(token);

        const channel = supabase
            .channel("notifications-feed")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                },
                (payload) => {
                    const notification = payload.new as RealtimeNotification;
                    if (!notification.is_seen) {
                        toast.info(notification.text, {
                            duration: 6000,
                            description: "Task deadline approaching",
                        });

                        // Mark as seen immediately after displaying the toast
                        markSeen(notification.id).catch(() => {
                            // Silently ignore — endpoint may not be live yet
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);
}
