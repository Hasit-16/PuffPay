
"use client";

import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import BalanceCard from "@/components/dashboard/BalanceCard";
import FriendRow from "@/components/dashboard/FriendRow";

// --- Mock Data ---
const MOCK_FRIENDS = [
    { id: "1", name: "Rahul", amount: 120, avatar: "" },
    { id: "2", name: "Anjali", amount: -45, avatar: "" },
    { id: "3", name: "Vikram", amount: 500, avatar: "" },
    { id: "4", name: "Sneha", amount: -150, avatar: "" },
    { id: "5", name: "Arjun", amount: 0, avatar: "" },
];

export default function Dashboard() {
    const totalToReceive = MOCK_FRIENDS.filter((f) => f.amount > 0).reduce(
        (acc, curr) => acc + curr.amount,
        0
    );
    const totalToPay = Math.abs(
        MOCK_FRIENDS.filter((f) => f.amount < 0).reduce(
            (acc, curr) => acc + curr.amount,
            0
        )
    );
    const netBalance = totalToReceive - totalToPay;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* 1. Sticky Top Bar */}
            <TopBar />

            <main className="px-4 py-6 space-y-8">
                {/* 2. Balance Card */}
                <section>
                    <BalanceCard
                        netBalance={netBalance}
                        toPay={totalToPay}
                        toReceive={totalToReceive}
                    />
                </section>

                {/* 3. Friends List */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            Friends
                        </h2>
                        <button className="text-xs font-semibold text-green-600 hover:text-green-700">
                            See All
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                        {MOCK_FRIENDS.map((friend) => (
                            <FriendRow
                                key={friend.id}
                                id={friend.id}
                                name={friend.name}
                                amount={friend.amount}
                                avatar={friend.avatar}
                            />
                        ))}
                    </div>
                </section>
            </main>

            {/* 4. Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
