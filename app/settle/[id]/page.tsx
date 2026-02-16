import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Check, X, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { settleAllTransactions, approveAllSettlements, rejectAllSettlements } from "../actions";
import { redirect } from "next/navigation";

export default async function SettlePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { id: friendId } = await params;
    console.log("SettlePage params.id:", friendId);

    // Fetch friend profile
    const { data: friend, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", friendId)
        .maybeSingle(); // Use maybeSingle to avoid error on 0 rows

    if (profileError) {
        console.error("Error fetching friend profile:", JSON.stringify(profileError, null, 2));
    }

    if (!friend) {
        console.error("Friend not found in DB. ID:", friendId);
        return <div className="p-10 text-center">Friend with ID {friendId} not found.</div>;
    }

    // Calculate Balance & Status
    // We need to fetch transactions between me and friend
    const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .or(`payer_id.eq.${user.id},borrower_id.eq.${user.id}`)
        .or(`payer_id.eq.${friendId},borrower_id.eq.${friendId}`)
        .neq("status", "rejected")
        .neq("status", "settled")
        .neq("status", "paid"); // Legacy check

    // Calculate Net Balance (considering pending & confirming)
    let balance = 0;

    // Check if there are any transactions in 'confirming' state
    const confirmingTransactions = transactions?.filter(t => t.status === 'confirming') || [];
    const pendingTransactions = transactions?.filter(t => t.status === 'pending') || [];

    transactions?.forEach((t) => {
        const amount = Number(t.amount);
        if (t.payer_id === user.id) {
            balance += amount; // I paid, they owe me (+)
        } else {
            balance -= amount; // They paid, I owe them (-)
        }
    });

    console.log("SettlePage Debug:", {
        userId: user.id,
        friendId,
        balance,
        totalTransactions: transactions?.length,
        confirming: confirmingTransactions.length,
        pending: pendingTransactions.length,
        isDebt: balance < 0,
        isOwed: balance > 0
    });

    const isOwed = balance > 0;
    const isDebt = balance < 0;
    const absBalance = Math.abs(balance);

    // Use the imported action, binding the friendId
    const settleAction = settleAllTransactions.bind(null, friendId);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <TopBar />

            <main className="p-4 flex flex-col items-center pt-10">
                <Avatar className="h-24 w-24 mb-4 border-4 border-white dark:border-slate-800 shadow-xl">
                    <AvatarImage src={friend.avatar_url || ""} />
                    <AvatarFallback className="text-2xl">{friend.username?.charAt(0)}</AvatarFallback>
                </Avatar>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {friend.username}
                </h1>

                <div className={`text-4xl font-bold my-6 tabular-nums ${isDebt ? 'text-red-500' : 'text-green-500'}`}>
                    {isDebt ? '-' : '+'}₹{absBalance.toLocaleString()}
                </div>

                <div className="w-full max-w-sm space-y-4">
                    {isDebt && (
                        <>
                            {/* If we have pending confirmation */}
                            {confirmingTransactions.length > 0 && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center mb-4">
                                    <p className="text-amber-700 dark:text-amber-400 font-medium mb-2">
                                        Waiting for approval
                                    </p>
                                    <Button
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                                        asChild
                                    >
                                        <a
                                            href={`https://wa.me/?text=${encodeURIComponent(`Hey ${friend.username}! I've sent you ₹${absBalance}. Please verify on PuffPay!`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Bell className="w-4 h-4 mr-2" />
                                            Nudge on WhatsApp
                                        </a>
                                    </Button>
                                </div>
                            )}

                            {/* Pay Button */}
                            {pendingTransactions.length > 0 && (
                                <form action={settleAction}>
                                    <Button className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-none">
                                        I Have Paid This
                                    </Button>
                                </form>
                            )}
                        </>
                    )}

                    {!isDebt && !isOwed && (
                        <div className="text-center text-slate-500">
                            You are all settled up!
                        </div>
                    )}

                    {isOwed && (
                        <>
                            {/* LENDER VIEW */}
                            {/* If there are items to confirm (Amber) */}
                            {confirmingTransactions.filter(t => t.payer_id === user.id).length > 0 && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center mb-4 space-y-3">
                                    <p className="text-amber-700 dark:text-amber-400 font-medium">
                                        Payment Waiting for Approval
                                    </p>
                                    <form action={approveAllSettlements.bind(null, friendId)}>
                                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white mb-2">
                                            <Check className="w-4 h-4 mr-2" />
                                            Confirm Receipt
                                        </Button>
                                    </form>
                                    <form action={rejectAllSettlements.bind(null, friendId)}>
                                        <Button variant="outline" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
                                            <X className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {/* If balance is positive, show Nudge option */}
                            {/* Only show if we don't have confirming ones taking up space? Or always? */}
                            {/* Let's show if confirming is 0 OR just always enable nudge if owed */}
                            {confirmingTransactions.filter(t => t.payer_id === user.id).length === 0 && (
                                <Button
                                    className="w-full h-12 text-lg font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                                    asChild
                                >
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(`Hey ${friend.username}! You owe me ₹${absBalance}. Can you settle this?`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Bell className="w-5 h-5 mr-2" />
                                        Remind to Pay
                                    </a>
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
