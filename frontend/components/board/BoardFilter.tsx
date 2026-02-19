"use client";

import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LabelPicker } from "@/components/board/LabelPicker";
import { Label } from "@/lib/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

export interface FilterState {
    search: string;
    labels: Label[];
    sortBy: "rank" | "dueDate" | "title";
}

interface BoardFilterProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
}

export function BoardFilter({ filters, onFilterChange }: BoardFilterProps) {

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, search: e.target.value });
    };

    const handleLabelChange = (newLabels: Label[]) => {
        onFilterChange({ ...filters, labels: newLabels });
    };

    const handleSortChange = (value: string) => {
        onFilterChange({ ...filters, sortBy: value as FilterState["sortBy"] });
    };

    const clearFilters = () => {
        onFilterChange({ search: "", labels: [], sortBy: "rank" });
    };

    const hasActiveFilters = filters.search || filters.labels.length > 0 || filters.sortBy !== "rank";

    return (
        <div className="flex flex-col sm:flex-row gap-3 items-center mb-4 w-full">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Filter tasks..."
                    className="pl-9 bg-white"
                    value={filters.search}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                {/* Label Filter Popover - Reusing LabelPicker logic but for filtering */}
                <div className="min-w-[150px]">
                    <LabelPicker
                        selectedLabels={filters.labels}
                        onChange={handleLabelChange}
                    />
                </div>

                {/* Sort Dropdown */}
                <Select value={filters.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[140px] bg-white">
                        <ArrowUpDown className="mr-2 h-4 w-4 text-slate-400" />
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rank">Custom Order</SelectItem>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="title">Alphabetical</SelectItem>
                    </SelectContent>
                </Select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearFilters}
                        className="text-slate-400 hover:text-slate-600"
                        title="Clear filters"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
