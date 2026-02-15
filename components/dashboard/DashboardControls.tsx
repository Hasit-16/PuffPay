"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Check, SlidersHorizontal } from "lucide-react";

interface DashboardControlsProps {
    hideFavorites: boolean;
    setHideFavorites: (value: boolean) => void;
    sortOption: string;
    setSortOption: (value: string) => void;
}

export default function DashboardControls({
    hideFavorites,
    setHideFavorites,
    sortOption,
    setSortOption,
}: DashboardControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between py-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Friends
            </h2>

            <div className="flex items-center gap-2">
                {/* Hide Favorites Toggle */}
                <button
                    onClick={() => setHideFavorites(!hideFavorites)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${hideFavorites
                            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                >
                    <div
                        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${hideFavorites
                                ? "bg-amber-500 border-amber-500"
                                : "border-slate-400 dark:border-slate-500"
                            }`}
                    >
                        {hideFavorites && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    Hide Favorites
                </button>

                {/* Sort Dropdown */}
                <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-full">
                        <SlidersHorizontal className="w-3 h-3 mr-2" />
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="amount_high">Amount (High to Low)</SelectItem>
                        <SelectItem value="amount_low">Amount (Low to High)</SelectItem>
                        <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
