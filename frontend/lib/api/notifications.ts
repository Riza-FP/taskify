import { apiFetch } from "./client";

export interface NotificationSettings {
    notify_before_days: number;
}

export interface Notification {
    id: number;
    text: string;
    is_seen: boolean;
    task_id: number;
    created_at: string;
}

// GET /notification/settings — fetch current user's notification settings  
export async function getNotificationSettings(): Promise<NotificationSettings> {
    const response = await apiFetch("/notification/settings");
    return response.data;
}

// PUT /notification/settings — update notification settings
export async function updateNotificationSettings(days: number): Promise<void> {
    await apiFetch("/notification/settings", {
        method: "PUT",
        body: JSON.stringify({ days }),
    });
}

// GET /notification/inbox — fetch all notifications for current user
export async function getNotifications(): Promise<Notification[]> {
    const response = await apiFetch("/notification/inbox");
    return response.data ?? [];
}

// PATCH /notification/:id/seen — mark a single notification as seen
export async function markSeen(id: number): Promise<void> {
    await apiFetch(`/notification/${id}/seen`, { method: "PATCH" });
}
