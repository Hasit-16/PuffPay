

import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import BalanceCard from "@/components/dashboard/BalanceCard";
import FriendRow from "@/components/dashboard/FriendRow";
import { getDashboardData } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
    const data = await getDashboardData();

    if (!data) {
        // Handle unauthenticated or error state gracefully
        // In a real app, middleware should catch this, but just in case
        return <div className="p-4 text-center text-red-500">Failed to load data. Please log in.</div>;
    }

    const { userBalance, totalToPay, totalToReceive, friendList } = data;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* 1. Sticky Top Bar */}
            <TopBar />

            <main className="px-4 py-6 space-y-8">
                {/* 2. Balance Card */}
                <section>
                    <BalanceCard
                        netBalance={userBalance}
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
                        {friendList.length > 0 && (
                            <Link href="/friends" className="text-xs font-semibold text-green-600 hover:text-green-700">
                                See All
                            </Link>
                        )}
                    </div>

                    {friendList.length === 0 ? (
                        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                                    <UserPlus className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                                    No friends yet
                                </h3>
                                <p className="text-xs text-slate-500 max-w-[200px] mb-4">
                                    Add some friends to start splitting expenses!
                                </p>
                                {/* Placeholder button - functionality to be added later */}
                                <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg">
                                    Add Friend
                                </button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                            {friendList.map((friend) => (
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
            </main>

            {/* 4. Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
