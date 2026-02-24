import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default function Loading() {
    return (
        <div className="min-h-screen pb-20">
            <TopBar />

            <main className="p-4 flex flex-col items-center pt-4">
                <div className="w-full max-w-sm mx-auto h-80 bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col items-center mt-8 space-y-6 animate-pulse">
                    <div className="h-24 w-24 bg-white/10 rounded-full border-4 border-white/10 shadow-lg mb-4"></div>
                    <div className="h-8 w-32 bg-white/10 rounded-md mt-4"></div>
                    <div className="h-10 w-24 bg-white/10 rounded-md mt-2"></div>
                </div>

                <div className="w-full max-w-sm space-y-4 mt-8 animate-pulse">
                    <div className="h-14 w-full bg-white/10 rounded-xl mt-auto"></div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
