
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface BalanceCardProps {
    netBalance: number;
    toPay: number;
    toReceive: number;
}

export default function BalanceCard({ netBalance, toPay, toReceive }: BalanceCardProps) {
    const isPositive = netBalance >= 0;

    return (
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
            {/* Centered horizontal underglow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[40%] blur-[60px] rounded-full pointer-events-none z-0 ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}></div>

            <CardContent className="p-6 relative z-10">
                <div className="text-center mb-6">
                    <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">
                        Net Balance
                    </p>
                    <h2 className={`text-4xl font-black tracking-tighter ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? "+" : "-"}₹{(Math.round(Math.abs(netBalance) * 100) / 100).toFixed(2)}
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1 text-red-400">
                            <div className="p-1 bg-red-500/10 rounded-full">
                                <ArrowUpRight size={14} />
                            </div>
                            <span className="text-xs font-semibold text-zinc-50">You Owe</span>
                        </div>
                        <p className="text-lg font-bold text-zinc-50">₹{(Math.round(toPay * 100) / 100).toFixed(2)}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1 text-green-400">
                            <div className="p-1 bg-green-500/10 rounded-full">
                                <ArrowDownLeft size={14} />
                            </div>
                            <span className="text-xs font-bold text-zinc-50">Owed to You</span>
                        </div>
                        <p className="text-lg font-bold text-zinc-50">₹{(Math.round(toReceive * 100) / 100).toFixed(2)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
