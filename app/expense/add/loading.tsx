import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default function Loading() {
    return (
        <div className="min-h-screen pb-20">
            <TopBar />
            <main className="px-4 py-6 max-w-2xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 w-40 bg-white/10 rounded-lg mb-6"></div>

                {/* Toggle */}
                <div className="h-12 w-full max-w-xs mx-auto bg-white/10 rounded-xl mb-6"></div>

                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-2xl space-y-6">
                    <div className="h-12 w-full bg-white/10 rounded-xl"></div>
                    <div className="h-12 w-full bg-white/10 rounded-xl"></div>

                    <div className="h-24 w-full bg-white/10 rounded-2xl"></div>

                    <div className="h-14 w-full bg-white/10 rounded-xl"></div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
