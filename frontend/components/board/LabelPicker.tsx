"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, ChevronsUpDown, Plus, X, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { getLabels, createLabel, toggleLabel } from "@/lib/api/labels";
import { toast } from "sonner";

// Preset colors — stored as hex in the DB, rendered via inline style
const PRESET_COLORS = [
    { name: "Red", hex: "#ef4444" },
    { name: "Orange", hex: "#f97316" },
    { name: "Amber", hex: "#f59e0b" },
    { name: "Yellow", hex: "#eab308" },
    { name: "Lime", hex: "#84cc16" },
    { name: "Green", hex: "#22c55e" },
    { name: "Emerald", hex: "#10b981" },
    { name: "Teal", hex: "#14b8a6" },
    { name: "Cyan", hex: "#06b6d4" },
    { name: "Sky", hex: "#0ea5e9" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Indigo", hex: "#6366f1" },
    { name: "Violet", hex: "#8b5cf6" },
    { name: "Purple", hex: "#a855f7" },
    { name: "Fuchsia", hex: "#d946ef" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Rose", hex: "#f43f5e" },
];

interface LabelPickerProps {
    selectedLabels: Label[];
    onChange: (labels: Label[]) => void;
    /** If provided, toggle calls will also persist to the API (task context). If absent, filter-only mode. */
    taskId?: string;
}

export function LabelPicker({ selectedLabels, onChange, taskId }: LabelPickerProps) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newLabelName, setNewLabelName] = useState("");
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
    const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
    const [loadingLabels, setLoadingLabels] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Load labels from API when popover opens
    const loadLabels = useCallback(async () => {
        setLoadingLabels(true);
        try {
            const data = await getLabels();
            setAvailableLabels(data);
        } catch {
            toast.error("Failed to load labels");
        } finally {
            setLoadingLabels(false);
        }
    }, []);

    useEffect(() => {
        if (open) loadLabels();
    }, [open, loadLabels]);

    const toggleLabelOnTask = async (label: Label) => {
        const isSelected = selectedLabels.some((l) => l.id === label.id);

        // Optimistic update
        if (isSelected) {
            onChange(selectedLabels.filter((l) => l.id !== label.id));
        } else {
            onChange([...selectedLabels, label]);
        }

        // If a taskId is provided (task detail context), persist to API
        if (taskId) {
            setTogglingId(label.id);
            try {
                await toggleLabel(taskId, label.id);
            } catch {
                // Revert on failure
                toast.error("Failed to update label");
                if (isSelected) {
                    onChange([...selectedLabels]);
                } else {
                    onChange(selectedLabels.filter((l) => l.id !== label.id));
                }
            } finally {
                setTogglingId(null);
            }
        }
    };

    const handleCreate = async () => {
        if (!newLabelName.trim()) return;

        // Creating a label requires a taskId on the backend (it links them together)
        if (!taskId) {
            toast.error("Open a task to create a new label");
            return;
        }

        setIsSaving(true);
        try {
            const newLabel = await createLabel(newLabelName.trim(), selectedColor.hex, taskId);
            setAvailableLabels((prev) => [...prev, newLabel]);
            onChange([...selectedLabels, newLabel]);
            setNewLabelName("");
            setIsCreating(false);
            setSearchValue("");
        } catch {
            toast.error("Failed to create label");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredLabels = searchValue.trim()
        ? availableLabels.filter((l) =>
            l.name.toLowerCase().includes(searchValue.toLowerCase())
        )
        : availableLabels;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedLabels.length > 0
                        ? `${selectedLabels.length} label${selectedLabels.length > 1 ? "s" : ""} selected`
                        : "Select labels..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                    {!isCreating ? (
                        <>
                            <CommandInput
                                placeholder="Search label..."
                                value={searchValue}
                                onValueChange={setSearchValue}
                            />
                            <CommandList>
                                {loadingLabels ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                    </div>
                                ) : (
                                    <>
                                        <CommandEmpty>
                                            <div className="p-2 text-sm text-center text-muted-foreground">
                                                No label found.
                                            </div>
                                            {taskId && (
                                                <Button
                                                    variant="ghost"
                                                    className="w-full text-xs h-8 mt-1"
                                                    onClick={() => {
                                                        setNewLabelName(searchValue);
                                                        setIsCreating(true);
                                                    }}
                                                >
                                                    <Plus className="mr-2 h-3 w-3" />
                                                    Create &quot;{searchValue}&quot;
                                                </Button>
                                            )}
                                        </CommandEmpty>
                                        <CommandGroup heading="Labels">
                                            {filteredLabels.map((label) => {
                                                const isSelected = selectedLabels.some((l) => l.id === label.id);
                                                const isToggling = togglingId === label.id;
                                                return (
                                                    <CommandItem
                                                        key={label.id}
                                                        value={label.name}
                                                        onSelect={() => toggleLabelOnTask(label)}
                                                        disabled={isToggling}
                                                    >
                                                        {isToggling ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    isSelected ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                        )}
                                                        <div
                                                            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                                            style={{ backgroundColor: label.color }}
                                                        />
                                                        {label.name}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                        {taskId && (
                                            <>
                                                <CommandSeparator />
                                                <CommandGroup>
                                                    <CommandItem onSelect={() => setIsCreating(true)}>
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Create new label
                                                    </CommandItem>
                                                </CommandGroup>
                                            </>
                                        )}
                                    </>
                                )}
                            </CommandList>
                        </>
                    ) : (
                        <div className="p-2 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">New Label</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setIsCreating(false)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Input
                                    placeholder="Label name"
                                    value={newLabelName}
                                    onChange={(e) => setNewLabelName(e.target.value)}
                                    className="h-8 text-sm"
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                                />

                                <div className="grid grid-cols-5 gap-1">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color.name}
                                            className={cn(
                                                "w-6 h-6 rounded-md transition-all hover:scale-110 focus:outline-none",
                                                selectedColor.name === color.name
                                                    ? "ring-2 ring-offset-1 ring-slate-900"
                                                    : ""
                                            )}
                                            style={{ backgroundColor: color.hex }}
                                            onClick={() => setSelectedColor(color)}
                                            title={color.name}
                                        />
                                    ))}
                                </div>

                                {/* Preview */}
                                {newLabelName.trim() && (
                                    <div className="flex items-center gap-2 p-1">
                                        <span
                                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                            style={{ backgroundColor: selectedColor.hex }}
                                        >
                                            {newLabelName}
                                        </span>
                                    </div>
                                )}

                                <Button
                                    size="sm"
                                    className="w-full"
                                    disabled={!newLabelName.trim() || isSaving}
                                    onClick={handleCreate}
                                >
                                    {isSaving ? (
                                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    ) : null}
                                    {isSaving ? "Creating..." : "Create"}
                                </Button>
                            </div>
                        </div>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
