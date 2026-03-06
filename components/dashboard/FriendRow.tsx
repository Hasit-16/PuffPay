"use client";

import { Bell, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface FriendRowProps {
    id: string;
    name: string;
    avatar?: string;
    amount: number; // positive = they owe you, negative = you owe them
    hasPendingApproval?: boolean;
}

export default function FriendRow({ id, name, avatar, amount, hasPendingApproval }: FriendRowProps) {
    const isOwed = amount > 0;
    const isDebt = amount < 0;
    const isSettled = amount === 0;

    const router = useRouter();

    const handleNudge = () => {
        const formattedAmount = (Math.round(Math.abs(amount) * 100) / 100).toFixed(2);
        const text = encodeURIComponent(`Hey ${name}! Just a quick reminder that you owe me ₹${formattedAmount} on PuffPay. 💸 Settle up whenever you can!`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <div
            onClick={() => router.push(`/settle/${id}`)}
            className="relative mb-3 overflow-hidden bg-[#0a0a0c] backdrop-blur-md border border-white/10 rounded-2xl p-4 w-full cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all duration-150"
        >
            {/* Dynamic Underglow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[50%] blur-[30px] rounded-full pointer-events-none z-0 ${amount >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}></div>

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-white/10">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback className="bg-white/5 text-zinc-300 font-bold">
                            {name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h3 className="font-semibold text-zinc-50 leading-tight">
                            {name}
                        </h3>
                        {isSettled ? (
                            <p className="text-xs text-zinc-400 mt-0.5">All settled up</p>
                        ) : (
                            <p className={`text-xs font-medium mt-0.5 ${isOwed ? 'text-green-500' : 'text-red-400'}`}>
                                {isOwed ? 'Owes you' : 'You owe'}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        {isSettled ? (
                            <Badge variant="secondary" className="bg-white/10 text-zinc-400 font-normal border-none hover:bg-white/10">Settled</Badge>
                        ) : (
                            <span className={`text-lg font-bold tabular-nums ${isOwed ? 'text-green-500' : isDebt ? 'text-red-500' : 'text-zinc-400'}`}>
                                {isOwed ? '+' : '-'}₹{(Math.round(Math.abs(amount) * 100) / 100).toFixed(2)}
                            </span>
                        )}
                        {hasPendingApproval && (
                            <div className="text-[10px] text-amber-600 font-medium flex items-center justify-end mt-1">
                                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1 animate-pulse"></span>
                                Confirming
                            </div>
                        )}
                    </div>

                    {isOwed && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNudge(); }}
                            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-zinc-50 transition-colors pointer-events-auto relative z-20"
                            title="Send Reminder"
                        >
                            <Bell className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
