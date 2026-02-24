import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default function Loading() {
    return (
        <div className="min-h-screen pb-20">
            <TopBar />

            <main className="px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-8 w-24 bg-white/10 animate-pulse rounded-lg"></div>
                    <div className="flex gap-2">
                        <div className="h-8 w-24 bg-white/10 animate-pulse rounded-lg"></div>
                    </div>
                </div>

                <div className="h-10 w-full bg-white/10 animate-pulse rounded-xl mb-6"></div>

                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3 flex items-center justify-between mb-3 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                                <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                            </div>
                            <div className="h-5 w-16 bg-white/10 rounded-md"></div>
                        </div>
                    ))}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
