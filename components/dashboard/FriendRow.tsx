"use client";

import { Bell, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { motion, useAnimation, PanInfo } from "framer-motion";

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
    const controls = useAnimation();

    const handleNudge = () => {
        const formattedAmount = (Math.round(Math.abs(amount) * 100) / 100).toFixed(2);
        const text = encodeURIComponent(`Hey ${name}! Just a quick reminder that you owe me ₹${formattedAmount} on PuffPay. 💸 Settle up whenever you can!`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const handleDragEnd = async (event: any, info: PanInfo) => {
        const threshold = -80; // drag left to trigger action
        if (info.offset.x < threshold) {
            if (isOwed) {
                handleNudge();
            } else if (isDebt) {
                router.push(`/settle/${id}`);
            }
        }
        // Always snap back
        controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 25 } });
    };

    return (
        <div className="relative mb-3 rounded-2xl overflow-hidden active:scale-[0.98] transition-all duration-150">
            {/* Background Actions */}
            {isOwed && (
                <div className="absolute inset-y-0 right-0 w-full flex items-center justify-end px-6 bg-blue-500/80 rounded-2xl z-0">
                    <span className="text-white font-bold text-sm tracking-wide mr-2 flex items-center">
                        <Bell className="w-5 h-5 mr-2" /> Nudge
                    </span>
                </div>
            )}
            {isDebt && (
                <div className="absolute inset-y-0 right-0 w-full flex items-center justify-end px-6 bg-green-500/80 rounded-2xl z-0">
                    <span className="text-white font-bold text-sm tracking-wide mr-2 flex items-center">
                        <Wallet className="w-5 h-5 mr-2" /> Pay
                    </span>
                </div>
            )}

            {/* Foreground Swipeable Card */}
            <motion.div
                drag={isSettled ? false : "x"}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 1, right: 0.1 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ touchAction: "pan-y" }}
                onClick={() => router.push(`/settle/${id}`)}
                className="relative z-10 overflow-hidden bg-[#0a0a0c] backdrop-blur-md border border-white/10 rounded-2xl p-4 w-full h-full cursor-pointer hover:bg-[#121214]"
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
            </motion.div>
        </div>
    );
}
