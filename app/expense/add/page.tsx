"use client";

import { useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Check, X, Users, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createTransaction } from "@/app/expense/actions";
import { getMyFriends } from "@/app/friends/actions";
import { getMyGroups, getGroupMembers } from "@/app/groups/list_actions";

// Types
type Friend = { id: string; username: string | null; avatar_url: string | null };
type Group = { id: string; name: string };

const QUICK_CHIPS = ["☕ Chai", "🥪 Sandwich", "🍔 Burger", "🍕 Pizza", "🥗 Lunch", "🥘 Dinner", "🎬 Movie", "🚖 Cab"];

function SubmitButton({ disabled }: { disabled?: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" disabled={pending || disabled}>
            {pending ? "Saving..." : "Save Expense"}
            {!pending && <Save className="ml-2 w-4 h-4" />}
        </Button>
    );
}

export default function AddExpensePage() {
    const router = useRouter();
    const [mode, setMode] = useState<"individual" | "group">("individual");

    // Data
    const [friends, setFriends] = useState<Friend[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedGroupMembers, setSelectedGroupMembers] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState("");
    const [includedUserIds, setIncludedUserIds] = useState<string[]>([]);

    const amountInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Parallel fetch
        Promise.all([getMyFriends(), getMyGroups()]).then(([friendsData, groupsData]) => {
            setFriends(friendsData as any);
            setGroups(groupsData as any);
            setLoading(false);
        });

        // Auto-focus amount
        if (amountInputRef.current) {
            amountInputRef.current.focus();
        }
    }, []);

    // When group changes, fetch members
    useEffect(() => {
        if (mode === "group" && selectedGroupId) {
            getGroupMembers(selectedGroupId).then((members: any) => {
                setSelectedGroupMembers(members);
                // Default include everyone
                setIncludedUserIds(members.map((m: Friend) => m.id));
            });
        }
    }, [mode, selectedGroupId]);

    const handleChipClick = (chip: string) => {
        setDescription(chip);
    };

    const toggleMemberInclusion = (memberId: string) => {
        if (includedUserIds.includes(memberId)) {
            setIncludedUserIds(includedUserIds.filter(id => id !== memberId));
        } else {
            setIncludedUserIds([...includedUserIds, memberId]);
        }
    };

    const clientAction = async (formData: FormData) => {
        if (mode === "group") {
            if (includedUserIds.length === 0) {
                toast.error("Must include at least one person");
                return;
            }
            // Add included members to formData
            // We need to send them as JSON or repeated fields. 
            // The server action expects `borrower_ids` or `borrower_id`.
            // Let's modify server action to handle `borrower_ids` as a JSON string for flexibility.
            formData.append("borrower_ids", JSON.stringify(includedUserIds));

            // Also append mode
            formData.append("mode", "group");
        } else {
            // Individual Mode
            const borrowerId = formData.get("borrower_id");
            if (!borrowerId) {
                toast.error("Please select a friend");
                return;
            }
            formData.append("borrower_ids", JSON.stringify([borrowerId.toString()]));
            formData.append("mode", "individual");
        }

        const result = await createTransaction(formData);
        if (result?.error) {
            toast.error(result.error);
        } else if (result?.success) {
            toast.success("Expense added successfully");
            router.push("/dashboard");
        }
    };

    // Derived state for math
    const parsedAmount = parseFloat(amount) || 0;
    const splitCount = includedUserIds.length;
    const splitAmount = splitCount > 0 ? (parsedAmount / splitCount).toFixed(0) : "0";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-6">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold ml-2 text-slate-900 dark:text-white">Add Expense</h1>
            </div>

            {/* Mode Toggle */}
            <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6 max-w-md mx-auto">
                <button
                    onClick={() => setMode("individual")}
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${mode === "individual"
                        ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                        }`}
                >
                    <User className="w-4 h-4 mr-2" />
                    Individual
                </button>
                <button
                    onClick={() => setMode("group")}
                    className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all ${mode === "group"
                        ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                        }`}
                >
                    <Users className="w-4 h-4 mr-2" />
                    Group
                </button>
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

                {/* Logic Switch based on Mode */}
                {mode === "individual" ? (
                    /* INDIVIDUAL MODE */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                            <span className="text-slate-500">Paid by</span>
                            <span className="font-medium text-slate-900 dark:text-white">You</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Split with</label>
                            {loading ? (
                                <div className="h-12 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
                            ) : (
                                <select
                                    name="borrower_id"
                                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none appearance-none"
                                    required
                                >
                                    <option value="" disabled>Select a friend</option>
                                    {friends.map(friend => (
                                        <option key={friend.id} value={friend.id}>
                                            {friend.username}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                ) : (
                    /* GROUP MODE */
                    <div className="space-y-6">
                        {/* Group Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-500">Select Group</label>
                            <select
                                value={selectedGroupId}
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none appearance-none"
                                required
                            >
                                <option value="" disabled>Select a group</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex justify-end mt-2">
                                <Link href="/groups" className="text-xs flex items-center text-green-600 font-medium hover:underline">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Create new group
                                </Link>
                            </div>
                        </div>

                        {/* Avatar Row */}
                        {selectedGroupId && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-500">Tap to exclude</label>
                                <div className="flex overflow-x-auto pb-2 gap-4">
                                    {selectedGroupMembers.map(member => {
                                        const isIncluded = includedUserIds.includes(member.id);
                                        return (
                                            <div
                                                key={member.id}
                                                className="flex flex-col items-center space-y-1 cursor-pointer min-w-[64px]"
                                                onClick={() => toggleMemberInclusion(member.id)}
                                            >
                                                <div className="relative">
                                                    <Avatar className={`h-14 w-14 border-2 transition-all ${isIncluded ? 'border-green-500 shadow-md opacity-100' : 'border-slate-300 opacity-50 grayscale'}`}>
                                                        <AvatarImage src={member.avatar_url || ""} />
                                                        <AvatarFallback>{member.username?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center border border-white dark:border-slate-900 ${isIncluded ? 'bg-green-500' : 'bg-red-500'}`}>
                                                        {isIncluded ? <Check className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-medium truncate w-full text-center ${isIncluded ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                                    {member.username}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                {includedUserIds.length > 0 ? (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                        <p className="text-green-700 dark:text-green-300 font-medium text-sm">
                                            Splitting ₹{parsedAmount.toLocaleString()} between {splitCount} people
                                        </p>
                                        <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                                            Since you paid, you'll be owed ₹{splitAmount} from each.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-red-500 text-sm text-center font-medium">
                                        Must include at least one person!
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )
                }

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
                                onClick={() => handleChipClick(chip.split(" ")[1])}
                                className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4 pb-10">
                    <SubmitButton disabled={mode === "group" && includedUserIds.length === 0} />
                </div>

            </form >
        </div >
    );
}
