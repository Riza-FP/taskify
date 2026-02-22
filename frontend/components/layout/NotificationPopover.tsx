"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Loader2, Save, CheckCheck, Check, Settings, Inbox } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    getNotificationSettings,
    updateNotificationSettings,
    getNotifications,
    markSeen,
    Notification,
} from "@/lib/api/notifications";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "inbox" | "settings";

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationPopover() {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Tab>("inbox");

    // --- Inbox state ---
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [inboxLoading, setInboxLoading] = useState(false);
    const [inboxError, setInboxError] = useState(false);

    // --- Settings state ---
    const [days, setDays] = useState<number>(1);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const unreadCount = notifications.filter((n) => !n.is_seen).length;

    // Load inbox
    const loadInbox = useCallback(async () => {
        setInboxLoading(true);
        setInboxError(false);
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch {
            setInboxError(true);
        } finally {
            setInboxLoading(false);
        }
    }, []);

    // Load settings
    const loadSettings = useCallback(async () => {
        setSettingsLoading(true);
        try {
            const s = await getNotificationSettings();
            setDays(s.notify_before_days ?? 1);
        } catch {
            toast.error("Failed to load notification settings");
        } finally {
            setSettingsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        loadInbox();
        loadSettings();
    }, [open, loadInbox, loadSettings]);

    // Mark one as seen
    const handleMarkSeen = async (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_seen: true } : n))
        );
        try {
            await markSeen(id);
        } catch {
            // Revert on failure
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_seen: false } : n))
            );
        }
    };

    // Mark all as seen
    const handleMarkAllSeen = async () => {
        const unseen = notifications.filter((n) => !n.is_seen);
        if (!unseen.length) return;
        setNotifications((prev) => prev.map((n) => ({ ...n, is_seen: true })));
        try {
            await Promise.all(unseen.map((n) => markSeen(n.id)));
        } catch {
            toast.error("Failed to mark all as read");
            loadInbox(); // refetch to correct state
        }
    };

    const handleSaveSettings = async () => {
        if (days < 0) return;
        setSaving(true);
        try {
            await updateNotificationSettings(days);
            toast.success("Notification settings saved");
            setOpen(false);
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                    {unreadCount === 0 && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setTab("inbox")}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
                            tab === "inbox"
                                ? "border-b-2 border-indigo-500 text-indigo-600"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Inbox size={13} />
                        Inbox
                        {unreadCount > 0 && (
                            <span className="ml-0.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab("settings")}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors",
                            tab === "settings"
                                ? "border-b-2 border-indigo-500 text-indigo-600"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Settings size={13} />
                        Settings
                    </button>
                </div>

                {/* Inbox Tab */}
                {tab === "inbox" && (
                    <div className="flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50">
                            <span className="text-xs font-semibold text-slate-600">
                                Recent notifications
                            </span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllSeen}
                                    className="flex items-center gap-1 text-[11px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                                >
                                    <CheckCheck size={12} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                            {inboxLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                                </div>
                            ) : inboxError ? (
                                <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                                    <p className="text-xs text-slate-400">
                                        Couldn't load notifications.
                                    </p>
                                    <button
                                        onClick={loadInbox}
                                        className="text-xs text-indigo-500 hover:underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                                    <Bell size={24} className="text-slate-200" />
                                    <p className="text-xs text-slate-400">
                                        No notifications yet
                                    </p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "flex items-start gap-3 px-4 py-3 transition-colors",
                                            !n.is_seen ? "bg-indigo-50/60" : "bg-white"
                                        )}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            <div
                                                className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    !n.is_seen ? "bg-indigo-500" : "bg-slate-200"
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-700 leading-relaxed">
                                                {n.text}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">
                                                {timeAgo(n.created_at)}
                                            </p>
                                        </div>
                                        {!n.is_seen && (
                                            <button
                                                onClick={() => handleMarkSeen(n.id)}
                                                title="Mark as read"
                                                className="flex-shrink-0 rounded p-1 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                                            >
                                                <Check size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {tab === "settings" && (
                    <div className="p-4 space-y-4">
                        <div>
                            <p className="text-xs font-semibold text-slate-700 mb-0.5">
                                Deadline reminders
                            </p>
                            <p className="text-xs text-slate-400">
                                Get notified this many days before a task's deadline.
                            </p>
                        </div>

                        {settingsLoading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="number"
                                        min={0}
                                        max={30}
                                        value={days}
                                        onChange={(e) => setDays(Number(e.target.value))}
                                        className="w-20 text-center h-9 text-sm"
                                    />
                                    <span className="text-sm text-slate-500">
                                        day{days !== 1 ? "s" : ""} before deadline
                                    </span>
                                </div>

                                {/* Presets */}
                                <div className="flex gap-1.5 flex-wrap">
                                    {[0, 1, 2, 3, 7].map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => setDays(preset)}
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${days === preset
                                                    ? "bg-indigo-600 text-white border-indigo-600"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                                }`}
                                        >
                                            {preset === 0 ? "Same day" : `${preset}d`}
                                        </button>
                                    ))}
                                </div>

                                <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    ) : (
                                        <Save className="mr-2 h-3 w-3" />
                                    )}
                                    {saving ? "Saving..." : "Save Settings"}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
