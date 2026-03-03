import TopBar from "@/components/layout/TopBar";

export default function Loading() {
    return (
        <div className="min-h-screen pb-20">
            <TopBar />
            <main className="px-4 py-8 max-w-lg mx-auto space-y-8 animate-pulse">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-12 w-12 bg-white/10 rounded-xl"></div>
                    <div className="h-8 w-32 bg-white/10 rounded-lg"></div>
                </div>

                {/* Card */}
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col items-center">
                    <div className="h-24 w-24 bg-white/10 rounded-full mb-6 border-4 border-white/10"></div>

                    <div className="w-full space-y-4">
                        <div>
                            <div className="h-4 w-20 bg-white/10 rounded-md mb-2"></div>
                            <div className="h-12 w-full bg-white/10 rounded-xl"></div>
                        </div>
                        <div>
                            <div className="h-4 w-20 bg-white/10 rounded-md mb-2"></div>
                            <div className="h-12 w-full bg-white/10 rounded-xl"></div>
                        </div>
                        <div className="h-12 w-full bg-white/10 rounded-xl mt-6"></div>
                    </div>
                </div>
            </main>
        </div>
    );
}
