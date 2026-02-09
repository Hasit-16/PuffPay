"use client";

import { useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTransaction } from "@/app/expense/actions";
import { getMyFriends } from "@/app/friends/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Types
type Friend = { id: string; username: string | null; avatar_url: string | null };

const QUICK_CHIPS = ["☕ Chai", "🥪 Sandwich", "🍔 Burger", "🍕 Pizza", "🥗 Lunch", "🥘 Dinner", "🎬 Movie", "🚖 Cab"];

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" disabled={pending}>
            {pending ? "Saving..." : "Save Expense"}
            {!pending && <Save className="ml-2 w-4 h-4" />}
        </Button>
    );
}

export default function AddExpensePage() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const amountInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // fast load friends
        getMyFriends().then((data) => {
            setFriends(data as any);
            setLoading(false);
        });

        // Auto-focus amount
        if (amountInputRef.current) {
            amountInputRef.current.focus();
        }
    }, []);

    const handleChipClick = (chip: string) => {
        setDescription(chip);
    };

    const clientAction = async (formData: FormData) => {
        const result = await createTransaction(formData);
        if (result?.error) {
            alert(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6">
            {/* Header */}
            <div className="flex items-center mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold ml-2 text-slate-900 dark:text-white">Add Expense</h1>
            </div>

            <form action={clientAction} className="space-y-8 max-w-md mx-auto">

                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">Amount</label>
                    <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-400">₹</span>
                        <input
                            ref={amountInputRef}
                            type="number"
                            name="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-transparent text-5xl font-bold text-slate-900 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 focus:border-green-500 focus:outline-none pl-8 py-2 placeholder:text-slate-200 dark:placeholder:text-slate-800"
                            required
                            min="1"
                            step="any"
                        />
                    </div>
                </div>

                {/* Payer / Borrower */}
                <div className="space-y-4">
                    {/* Payer */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Paid by</span>
                        <span className="font-medium text-slate-900 dark:text-white">You</span>
                    </div>

                    {/* Borrower (Split with) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-500">Split with</label>
                        {loading ? (
                            <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                        ) : (
                            <select
                                name="borrower_id"
                                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none appearance-none"
                                required
                                defaultValue=""
                            >
                                <option value="" disabled>Select a friend</option>
                                {friends.map(friend => (
                                    <option key={friend.id} value={friend.id}>
                                        {friend.username}
                                    </option>
                                ))}
                            </select>
                        )}
                        {friends.length === 0 && !loading && (
                            <p className="text-xs text-red-500">You need to add friends first!</p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-500">For</label>
                    <Input
                        name="description"
                        placeholder="What's this for?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    />

                    {/* Quick Chips */}
                    <div className="flex flex-wrap gap-2">
                        {QUICK_CHIPS.map(chip => (
                            <button
                                key={chip}
                                type="button"
                                onClick={() => handleChipClick(chip.split(" ")[1])} // Takes just the text
                                className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <SubmitButton />
                </div>

            </form>
        </div>
    );
}
