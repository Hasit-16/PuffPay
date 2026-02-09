"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSettlementDetails, recordPayment, SettlementDetails } from "../actions";

export default function SettlePage() {
    const router = useRouter();
    const params = useParams();
    const friendId = params.id as string;

    const [details, setDetails] = useState<SettlementDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");

    useEffect(() => {
        getSettlementDetails(friendId).then((data) => {
            setDetails(data);
            if (data && data.balance !== 0) {
                setAmount(Math.abs(data.balance).toString());
            }
            setLoading(false);
        });
    }, [friendId]);

    const handleAction = async (formData: FormData) => {
        const result = await recordPayment(formData);
        if (result?.error) {
            toast.error(result.error);
        } else if (result?.success) {
            toast.success("Payment recorded!");
            router.push("/dashboard");
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 text-slate-500">Loading settlement details...</div>;
    }

    if (!details) {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">Friend not found.</div>;
    }

    const { friend, balance } = details;
    const isOwed = balance > 0;
    const isDebt = balance < 0;
    const isSettled = balance === 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold ml-2 text-slate-900 dark:text-white">Settle Up</h1>
            </div>

            {/* Profile & Balance */}
            <div className="flex-1 flex flex-col items-center pt-8">
                <Avatar className="w-24 h-24 mb-4 border-4 border-white dark:border-slate-900 shadow-sm">
                    <AvatarImage src={friend.avatar_url || ""} />
                    <AvatarFallback className="text-2xl">{friend.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                    {friend.username}
                </h2>

                <div className="mt-6 mb-12 text-center">
                    {isSettled ? (
                        <div className="animate-in zoom-in duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-3">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">All settled up!</p>
                            <p className="text-slate-500 mt-1">No pending debts with {friend.username}.</p>
                        </div>
                    ) : (
                        <>
                            <p className={`text-sm font-semibold tracking-wider uppercase mb-2 ${isOwed ? "text-green-600" : "text-red-500"}`}>
                                {isOwed ? "Owes you" : "You owe"}
                            </p>
                            <div className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                                ₹{Math.abs(balance).toLocaleString()}
                            </div>
                        </>
                    )}
                </div>

                {/* Action Form */}
                {!isSettled && (
                    <form action={handleAction} className="w-full max-w-sm space-y-6">
                        <input type="hidden" name="friendId" value={friend.id} />
                        <input type="hidden" name="direction" value={isDebt ? "pay" : "receive"} />

                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Amount to {isDebt ? "Pay" : "Receive"}
                            </label>
                            <div className="relative">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₹</span>
                                <input
                                    type="number"
                                    name="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full bg-transparent text-3xl font-bold text-slate-900 dark:text-white border-none focus:ring-0 p-0 pl-6 placeholder:text-slate-300"
                                    placeholder="0"
                                    min="1"
                                    step="any"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className={`w-full text-lg h-14 ${isDebt ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"} text-white shadow-lg shadow-slate-200 dark:shadow-none`}
                        >
                            {isDebt ? (
                                <>Pay {friend.username}</>
                            ) : (
                                <>Confirm Payment Received</>
                            )}
                        </Button>

                        <p className="text-center text-xs text-slate-400 px-4">
                            Recording this will add a transaction to clear the balance.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
