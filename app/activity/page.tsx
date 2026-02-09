"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getActivityLog, GroupedActivity } from "./actions";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function ActivityPage() {
    const [groupedActivity, setGroupedActivity] = useState<GroupedActivity>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getActivityLog().then((data) => {
            setGroupedActivity(data);
            setLoading(false);
        });
    }, []);

    const hasActivity = Object.keys(groupedActivity).length > 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <TopBar />

            <main className="px-4 py-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Activity</h1>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : !hasActivity ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 mb-4">
                            <ArrowUpRight className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No activity yet</h3>
                        <p className="text-slate-500">Expenses and settlements will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedActivity).map(([dateLabel, items]) => (
                            <div key={dateLabel}>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1 sticky top-16 bg-slate-50 dark:bg-slate-950 z-10 py-1">
                                    {dateLabel}
                                </h3>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar className="h-10 w-10 border border-slate-100 dark:border-slate-800">
                                                        <AvatarImage src={item.otherPerson.avatar_url || ""} />
                                                        <AvatarFallback>{item.otherPerson.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>

                                                    {/* Type Indicator Icon */}
                                                    <div className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 ${item.type === 'paid' ? 'bg-red-500' : 'bg-green-500'}`}>
                                                        {item.type === 'paid' ? (
                                                            <ArrowUpRight className="h-2 w-2 text-white" />
                                                        ) : (
                                                            <ArrowDownLeft className="h-2 w-2 text-white" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">{item.description}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {item.type === 'paid' ? `You paid ${item.otherPerson.username}` : `${item.otherPerson.username} paid you`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className={`font-bold text-sm tabular-nums whitespace-nowrap ${item.type === 'paid' ? 'text-red-500' : 'text-green-600'}`}>
                                                {item.type === 'paid' ? '-' : '+'} ₹{item.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
