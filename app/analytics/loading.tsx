import TopBar from "@/components/layout/TopBar";

export default function Loading() {
    return (
        <div className="min-h-screen pb-20">
            <TopBar />
            <main className="px-4 py-8 max-w-2xl mx-auto space-y-8 animate-pulse">
                <div className="flex gap-4">
                    <div className="h-8 w-8 bg-white/10 rounded-lg"></div>
                    <div className="h-8 w-40 bg-white/10 rounded-lg mb-6"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-64 bg-white/5 border border-white/10 rounded-[2rem] p-6"></div>
                    <div className="h-64 bg-white/5 border border-white/10 rounded-[2rem] p-6"></div>
                </div>
                <div className="h-80 bg-white/5 border border-white/10 rounded-[2rem] p-6"></div>
            </main>
        </div>
    );
}
