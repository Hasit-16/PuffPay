import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { getAnalyticsData } from "./actions";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <TopBar />

            <main className="px-4 py-6 max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" asChild className="-ml-2">
                        <Link href="/activity">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
                </div>

                {!data ? (
                    <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        Failed to load analytics data.
                    </div>
                ) : (
                    <AnalyticsCharts data={data} />
                )}
            </main>

            <BottomNav />
        </div>
    );
}
