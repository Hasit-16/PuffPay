import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { getActivityLog } from "./actions";
import { ArrowUpRight } from "lucide-react";
import ActivityItemRow from "@/components/activity/ActivityItemRow";
import ExportButton from "@/components/activity/ExportButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
    const groupedActivity = await getActivityLog();
    const hasActivity = Object.keys(groupedActivity).length > 0;

    return (
        <div className="min-h-screen bg-transparent pb-20">
            <TopBar />

            <main className="px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity</h1>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button asChild variant="outline" className="gap-2">
                            <Link href="/analytics">📈 <span className="hidden sm:inline">View </span>Analytics</Link>
                        </Button>
                        {hasActivity && <ExportButton transactions={Object.values(groupedActivity).flat()} />}
                    </div>
                </div>

                {!hasActivity ? (
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
                                <h3 className="text-zinc-400 font-semibold tracking-wider text-sm mb-3 sticky top-16 z-10 py-1 bg-transparent backdrop-blur-sm">
                                    {dateLabel}
                                </h3>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <ActivityItemRow key={item.id} item={item} />
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
