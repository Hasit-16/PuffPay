import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { getActivityLog } from "./actions";
import { ArrowUpRight } from "lucide-react";
import ActivityItemRow from "@/components/activity/ActivityItemRow";
import ExportButton from "@/components/activity/ExportButton";

export const dynamic = 'force-dynamic';

export default async function ActivityPage() {
    const groupedActivity = await getActivityLog();
    const hasActivity = Object.keys(groupedActivity).length > 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <TopBar />

            <main className="px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity</h1>
                    {hasActivity && <ExportButton transactions={Object.values(groupedActivity).flat()} />}
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
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1 sticky top-16 bg-slate-50 dark:bg-slate-950 z-10 py-1">
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
