import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800 mb-8">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-10 w-48 mb-6" />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div>
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>
            </div>

            {/* Friends List */}
            <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-transparent">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
