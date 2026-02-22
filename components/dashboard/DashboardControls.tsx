"use client";

import { useState, useEffect } from "react";

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between py-2">
                <h2 className="text-lg font-bold text-zinc-50">
                    Friends
                </h2>
                <div className="flex items-center gap-2">
                    {/* Skeleton or just emptiness to match layout */}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between py-2">
            <h2 className="text-lg font-bold text-zinc-50">
                Friends
            </h2>

            <div className="flex items-center gap-2">
                {/* Hide Favorites Toggle */}
                <button
                    onClick={() => setHideFavorites(!hideFavorites)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${hideFavorites
                        ? "bg-green-500/20 text-green-400 border-green-500/50"
                        : "bg-white/5 backdrop-blur-md text-zinc-300 border-white/10 hover:bg-white/10"
                        }`}
                >
                    <div
                        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${hideFavorites
                            ? "bg-green-500 border-green-500"
                            : "border-white/20"
                            }`}
                    >
                        {hideFavorites && <Check className="w-2.5 h-2.5 text-black" />}
                    </div>
                    Hide Favorites
                </button>

                {/* Sort Dropdown */}
                <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[140px] h-8 text-xs bg-white/5 backdrop-blur-md border border-white/10 text-zinc-300 rounded-full hover:bg-white/10">
                        <SlidersHorizontal className="w-3 h-3 mr-2" />
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 backdrop-blur-xl border border-white/10 text-zinc-50">
                        <SelectItem value="newest" className="focus:bg-white/10 focus:text-white">Newest</SelectItem>
                        <SelectItem value="amount_high" className="focus:bg-white/10 focus:text-white">Amount (High to Low)</SelectItem>
                        <SelectItem value="amount_low" className="focus:bg-white/10 focus:text-white">Amount (Low to High)</SelectItem>
                        <SelectItem value="name_asc" className="focus:bg-white/10 focus:text-white">Name (A-Z)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
