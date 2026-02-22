"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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

    const handleNudge = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const formattedAmount = (Math.round(Math.abs(amount) * 100) / 100).toFixed(2);
        const text = encodeURIComponent(`Hey ${name}! Just a quick reminder that you owe me ₹${formattedAmount} on PuffPay. 💸 Settle up whenever you can!`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    return (
        <Link href={`/settle/${id}`}>
            <div className="flex items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-3 transition-all hover:bg-white/10 active:scale-[0.98] group">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-slate-100 dark:border-slate-800">
                        <AvatarImage src={avatar} alt={name} />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                            {name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h3 className="font-semibold text-zinc-50 leading-tight">
                            {name}
                        </h3>
                        {isSettled ? (
                            <p className="text-xs text-slate-400 mt-0.5">All settled up</p>
                        ) : (
                            <p className={`text-xs font-medium mt-0.5 ${isOwed ? 'text-green-600' : 'text-red-500'}`}>
                                {isOwed ? 'Owes you' : 'You owe'}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        {isSettled ? (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-normal">Settled</Badge>
                        ) : (
                            <span className={`text-lg font-bold tabular-nums ${isOwed ? 'text-green-600' : 'text-red-500'}`}>
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
                            onClick={handleNudge}
                            className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 transition-colors"
                            title="Send Reminder"
                        >
                            <Bell className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
}
