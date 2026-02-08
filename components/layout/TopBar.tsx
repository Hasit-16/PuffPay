
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TopBar() {
    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 h-14">
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
                    PuffPay
                </h1>

                <Avatar className="w-8 h-8 border border-slate-200 dark:border-slate-700">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-xs">ME</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
