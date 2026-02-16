"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { initiateSettlement, approveSettlement, rejectSettlement } from "../actions";
import TrafficLightBadge from "@/components/dashboard/TrafficLightBadge";

export default function SettlePage() {
    const params = useParams();
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [transaction, setTransaction] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();

            // Get Current User
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);

            // Get Transaction
            const { data, error } = await supabase
                .from("transactions")
                .select(`
                    *,
                    payer:profiles!transactions_payer_id_fkey(*),
                    borrower:profiles!transactions_borrower_id_fkey(*)
                `)
                .eq("id", params.id)
                .single();

            if (error) {
                // If checking for friend settlement (legacy), this might fail if ID is friend ID.
                // For now, assume ID is transaction ID.
                // toast.error("Error fetching transaction");
                console.error("Fetch Error Details:", JSON.stringify(error, null, 2));
            } else {
                setTransaction(data);
            }
            setLoading(false);
        };

        fetchData();
    }, [params.id]);

    const handleInitiate = async () => {
        setActionLoading(true);
        try {
            await initiateSettlement(transaction.id);
            toast.success("Payment marked as sent! Waiting for approval.");
            router.refresh();
            // Optimistic update
            setTransaction({ ...transaction, status: 'confirming' });
        } catch (error) {
            toast.error("Failed to mark as paid");
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await approveSettlement(transaction.id);
            toast.success("Payment confirmed! Transaction settled.");
            router.refresh();
            setTransaction({ ...transaction, status: 'settled' });
        } catch (error) {
            toast.error("Failed to confirm payment");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        setActionLoading(true);
        try {
            await rejectSettlement(transaction.id);
            toast.error("Payment rejected. Status reverted to pending.");
            router.refresh();
            setTransaction({ ...transaction, status: 'pending' });
        } catch (error) {
            toast.error("Failed to reject payment");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 text-slate-500">Loading details...</div>;

    // Fallback if not found (or if ID was friend ID and query failed)
    if (!transaction || !currentUser) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <Link href="/dashboard" className="absolute top-4 left-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <p>Transaction not found.</p>
        </div>
    );

    const isPayer = transaction.payer_id === currentUser.id; // Lender
    const isBorrower = transaction.borrower_id === currentUser.id; // Borrower
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherPerson = isPayer ? transaction.borrower : transaction.payer;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 flex flex-col items-center justify-center">

            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden relative">
                <Link href="/dashboard" className="absolute top-4 left-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </Link>

                <div className="pt-12 pb-8 px-8 flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 border-4 border-slate-100 dark:border-slate-800 mb-6 shadow-lg">
                        <AvatarImage src={otherPerson?.avatar_url} />
                        <AvatarFallback className="text-2xl bg-slate-200 dark:bg-slate-700">
                            {otherPerson?.username?.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {isPayer ? `You lent to ${otherPerson.username}` : `You owe ${otherPerson.username}`}
                    </h1>

                    <div className="my-4">
                        <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            ₹{transaction.amount}
                        </span>
                    </div>

                    <p className="text-slate-500 mb-6 max-w-[200px]">
                        {transaction.description || "No description"}
                    </p>

                    <TrafficLightBadge
                        status={transaction.status}
                        perspective={isPayer ? 'lender' : 'borrower'}
                        className="scale-125 mb-8"
                    />

                    {/* ACTIONS */}
                    <div className="w-full space-y-3">
                        {isBorrower && transaction.status === 'pending' && (
                            <Button
                                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg shadow-green-600/20"
                                onClick={handleInitiate}
                                disabled={actionLoading}
                            >
                                {actionLoading ? "Processing..." : "I Have Paid This"}
                            </Button>
                        )}

                        {isBorrower && transaction.status === 'confirming' && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-4 rounded-xl flex items-center gap-3 text-left">
                                <Clock className="w-6 h-6 shrink-0" />
                                <p className="text-sm font-medium leading-tight">Waiting for {otherPerson.username} to confirm receipt.</p>
                            </div>
                        )}

                        {isPayer && transaction.status === 'confirming' && (
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <Button
                                    className="h-12 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 shadow-none dark:bg-red-900/40 dark:text-red-400 dark:border-red-900"
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                >
                                    <X className="w-5 h-5 mr-2" />
                                    Reject
                                </Button>
                                <Button
                                    className="h-12 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    Confirm
                                </Button>
                            </div>
                        )}

                        {isPayer && transaction.status === 'pending' && (
                            <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 p-4 rounded-xl flex items-center justify-center gap-2">
                                <span className="font-medium text-sm">Waiting for repayment</span>
                            </div>
                        )}

                        {transaction.status === 'settled' && (
                            <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 p-4 rounded-xl flex items-center justify-center gap-2">
                                <Check className="w-5 h-5" />
                                <span className="font-medium">Transaction Complete</span>
                            </div>
                        )}

                        {transaction.status === 'rejected' && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center justify-center gap-2">
                                <X className="w-5 h-5" />
                                <span className="font-medium">Settlement Rejected</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
