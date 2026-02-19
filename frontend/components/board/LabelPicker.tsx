"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";

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

// Preset colors for labels
const PRESET_COLORS = [
    { name: "Red", value: "bg-red-500 hover:bg-red-600 text-white" },
    { name: "Orange", value: "bg-orange-500 hover:bg-orange-600 text-white" },
    { name: "Amber", value: "bg-amber-500 hover:bg-amber-600 text-white" },
    { name: "Yellow", value: "bg-yellow-500 hover:bg-yellow-600 text-white" },
    { name: "Lime", value: "bg-lime-500 hover:bg-lime-600 text-white" },
    { name: "Green", value: "bg-green-500 hover:bg-green-600 text-white" },
    { name: "Emerald", value: "bg-emerald-500 hover:bg-emerald-600 text-white" },
    { name: "Teal", value: "bg-teal-500 hover:bg-teal-600 text-white" },
    { name: "Cyan", value: "bg-cyan-500 hover:bg-cyan-600 text-white" },
    { name: "Sky", value: "bg-sky-500 hover:bg-sky-600 text-white" },
    { name: "Blue", value: "bg-blue-500 hover:bg-blue-600 text-white" },
    { name: "Indigo", value: "bg-indigo-500 hover:bg-indigo-600 text-white" },
    { name: "Violet", value: "bg-violet-500 hover:bg-violet-600 text-white" },
    { name: "Purple", value: "bg-purple-500 hover:bg-purple-600 text-white" },
    { name: "Fuchsia", value: "bg-fuchsia-500 hover:bg-fuchsia-600 text-white" },
    { name: "Pink", value: "bg-pink-500 hover:bg-pink-600 text-white" },
    { name: "Rose", value: "bg-rose-500 hover:bg-rose-600 text-white" },
];

interface LabelPickerProps {
    selectedLabels: Label[];
    onChange: (labels: Label[]) => void;
}

export function LabelPicker({ selectedLabels, onChange }: LabelPickerProps) {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [newLabelName, setNewLabelName] = useState("");
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

    // Mock "All Labels" - In a real app, this would come from the store/database
    // For now, we'll just keep a local list or derived list. 
    // Ideally, this should be passed in as a prop "availableLabels".
    // Let's assume we maintain a list of *all* labels seen so far? 
    // Or just mock some defaults.
    const [availableLabels, setAvailableLabels] = useState<Label[]>([
        { id: "l1", name: "High Priority", color: "bg-red-500 hover:bg-red-600 text-white" },
        { id: "l2", name: "Bug", color: "bg-rose-500 hover:bg-rose-600 text-white" },
        { id: "l3", name: "Feature", color: "bg-blue-500 hover:bg-blue-600 text-white" },
        { id: "l4", name: "Design", color: "bg-pink-500 hover:bg-pink-600 text-white" },
    ]);

    const toggleLabel = (label: Label) => {
        const isSelected = selectedLabels.some((l) => l.id === label.id);
        if (isSelected) {
            onChange(selectedLabels.filter((l) => l.id !== label.id));
        } else {
            onChange([...selectedLabels, label]);
        }
    };

    const createLabel = () => {
        if (!newLabelName.trim()) return;

        const newLabel: Label = {
            id: `new-${Date.now()}`,
            name: newLabelName,
            color: selectedColor.value,
        };

        setAvailableLabels([...availableLabels, newLabel]);
        onChange([...selectedLabels, newLabel]);

        // Reset state
        setNewLabelName("");
        setIsCreating(false);
        setSearchValue("");
    };

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
                        ? `${selectedLabels.length} selected`
                        : "Select labels..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    {!isCreating ? (
                        <>
                            <CommandInput
                                placeholder="Search label..."
                                value={searchValue}
                                onValueChange={setSearchValue}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    <div className="p-2 text-sm text-center text-muted-foreground">
                                        No label found.
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="w-full text-xs h-8 mt-1"
                                        onClick={() => {
                                            setNewLabelName(searchValue);
                                            setIsCreating(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-3 w-3" />
                                        Create "{searchValue}"
                                    </Button>
                                </CommandEmpty>
                                <CommandGroup heading="Labels">
                                    {availableLabels.map((label) => {
                                        const isSelected = selectedLabels.some((l) => l.id === label.id);
                                        return (
                                            <CommandItem
                                                key={label.id}
                                                value={label.name}
                                                onSelect={() => toggleLabel(label)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        isSelected ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className={cn("w-3 h-3 rounded-full mr-2", label.color.split(' ')[0])} />
                                                {label.name}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem onSelect={() => setIsCreating(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create new label
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </>
                    ) : (
                        <div className="p-2 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">New Label</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCreating(false)}>
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
                                />

                                <div className="grid grid-cols-5 gap-1">
                                    {PRESET_COLORS.map((color) => (
                                        <button
                                            key={color.name}
                                            className={cn(
                                                "w-6 h-6 rounded-md transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400",
                                                color.value.split(' ')[0],
                                                selectedColor.name === color.name ? "ring-2 ring-offset-1 ring-slate-900" : ""
                                            )}
                                            onClick={() => setSelectedColor(color)}
                                            title={color.name}
                                        />
                                    ))}
                                </div>

                                <Button
                                    size="sm"
                                    className="w-full"
                                    disabled={!newLabelName.trim()}
                                    onClick={createLabel}
                                >
                                    Create
                                </Button>
                            </div>
                        </div>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
