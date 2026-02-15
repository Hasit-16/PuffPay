"use client";

import { useState, useMemo } from "react";
import DashboardControls from "@/components/dashboard/DashboardControls";
import FriendRow from "@/components/dashboard/FriendRow";
import { FriendWithBalance } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

interface DashboardClientViewProps {
    initialFriends: FriendWithBalance[];
}

export default function DashboardClientView({ initialFriends }: DashboardClientViewProps) {
    const [hideFavorites, setHideFavorites] = useState(false);
    const [sortOption, setSortOption] = useState("newest");

    const filteredAndSortedFriends = useMemo(() => {
        // 1. Base Filter: Always exclude 0 balance
        let result = initialFriends.filter((f) => f.balance !== 0);

        // 2. Toggle Filter: Hide Favorites
        if (hideFavorites) {
            result = result.filter((f) => !f.is_favorite);
        }

        // 3. Sort - Create a copy to sort
        result = [...result];

        switch (sortOption) {
            case "amount_high":
                // Highest positive (They owe me) -> Lowest negative (I owe them)
                result.sort((a, b) => b.balance - a.balance);
                break;
            case "amount_low":
                // Lowest negative (I owe them) -> Highest positive (They owe me)
                result.sort((a, b) => a.balance - b.balance);
                break;
            case "name_asc":
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case "newest":
            default:
                // Keep original order
                break;
        }

        return result;
    }, [initialFriends, hideFavorites, sortOption]);

    return (
        <section className="space-y-4">
            <DashboardControls
                hideFavorites={hideFavorites}
                setHideFavorites={setHideFavorites}
                sortOption={sortOption}
                setSortOption={setSortOption}
            />

            {filteredAndSortedFriends.length === 0 ? (
                <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                            <UserPlus className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                            No friends found
                        </h3>
                        <p className="text-xs text-slate-500 max-w-[200px] mb-4">
                            Try adjusting your filters or add new friends to start splitting expenses!
                        </p>
                        {/* Placeholder button */}
                        <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg">
                            Add Friend
                        </button>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAndSortedFriends.map((friend) => (
                        <FriendRow
                            key={friend.id}
                            id={friend.id}
                            name={friend.name}
                            amount={friend.balance}
                            avatar={friend.avatar}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
