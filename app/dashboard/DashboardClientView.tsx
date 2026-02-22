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

        // 2.5 Prioritize Pending Approvals (Traffic Light)
        // Friends with 'hasPendingApproval' should be at the top?
        // Or just let normal sort handle it?
        // Let's sort them to top by default if "Newest" or default sort.
        // Actually, let's make it a primary sort criteria for ALL sorts?
        // No, maybe just for "action required".
        // Let's stick to simple sort for now, but ensure we pass the prop.

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
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-3 transition-all hover:bg-white/10">
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="bg-white/10 p-4 rounded-full mb-4">
                            <UserPlus className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-50 mb-1">
                            No friends found
                        </h3>
                        <p className="text-xs text-zinc-400 max-w-[200px] mb-4">
                            Try adjusting your filters or add new friends to start splitting expenses!
                        </p>
                        {/* Placeholder button */}
                        <button className="px-4 py-2 bg-green-500 text-black text-xs font-bold rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                            Add Friend
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredAndSortedFriends.map((friend) => (
                        <FriendRow
                            key={friend.id}
                            id={friend.id}
                            name={friend.name}
                            amount={friend.balance}
                            avatar={friend.avatar}
                            hasPendingApproval={friend.hasPendingApproval}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
