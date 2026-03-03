import TopBar from "@/components/layout/TopBar";

export default function Loading() {
    return (
        <div className="min-h-screen pb-20">
            <TopBar />

            <main className="px-4 py-6 max-w-2xl mx-auto">
                <div className="mb-4">
                    <div className="h-6 w-32 bg-white/10 animate-pulse rounded-md"></div>
                </div>

                <div className="mb-6 space-y-6">
                    <div className="h-32 w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center animate-pulse">
                        <div className="h-8 w-40 bg-white/10 rounded-lg mb-3"></div>
                        <div className="h-4 w-24 bg-white/10 rounded-md"></div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-2xl animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-6 w-24 bg-white/10 rounded-md"></div>
                            <div className="h-8 w-28 bg-white/10 rounded-xl"></div>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(item => (
                                <div key={item} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                                        <div className="h-5 w-24 bg-white/10 rounded-md ml-3"></div>
                                    </div>
                                    <div className="h-8 w-8 bg-white/10 rounded-md"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}
