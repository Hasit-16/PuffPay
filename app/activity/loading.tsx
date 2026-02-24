import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default function Loading() {
    return (
        <div className="min-h-screen pb-20">
            <TopBar />

            <main className="px-4 py-6 max-w-2xl mx-auto">
                <div className="h-8 w-32 bg-white/10 animate-pulse rounded-lg mb-6"></div>
                <div className="h-10 w-full mb-6 bg-white/10 animate-pulse rounded-xl"></div>
                <div className="space-y-6">
                    {[1, 2].map(group => (
                        <div key={group} className="animate-pulse">
                            <div className="h-6 w-20 bg-white/10 rounded-full mx-auto mb-4 mt-6"></div>
                            {[1, 2, 3].map(item => (
                                <div key={item} className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                                        <div className="flex flex-col gap-2">
                                            <div className="h-5 w-32 bg-white/10 rounded-md"></div>
                                            <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                                        </div>
                                    </div>
                                    <div className="h-5 w-16 bg-white/10 rounded-md"></div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
