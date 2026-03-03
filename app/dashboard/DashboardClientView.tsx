"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
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

    useEffect(() => {
        const saved = localStorage.getItem('puffpay_hide_favorites');
        if (saved !== null) {
            setHideFavorites(saved === 'true');
        }
    }, []);

    const handleToggleFavorites = () => {
        setHideFavorites(prev => {
            const newState = !prev;
            localStorage.setItem('puffpay_hide_favorites', String(newState));
            return newState;
        });
    };

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
                setHideFavorites={handleToggleFavorites}
                sortOption={sortOption}
                setSortOption={setSortOption}
            />

            {filteredAndSortedFriends.length === 0 ? (
                <div className="w-full p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center backdrop-blur-md drop-shadow-xl">
                    <div className="text-5xl mb-4 drop-shadow-lg">💸</div>
                    <h3 className="text-lg font-semibold text-zinc-50 mb-2">
                        No activity yet
                    </h3>
                    <p className="text-sm text-zinc-400 max-w-[220px]">
                        Tap the + button to get started.
                    </p>
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
