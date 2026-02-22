"use client";

import { useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Check, X, Users, User, Plus } from "lucide-react";
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

    // Split Mode State
    const [splitType, setSplitType] = useState<"equal" | "exact">("equal");
    const [exactAmounts, setExactAmounts] = useState<Record<string, number>>({});

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
                // Initialize exact amounts
                const initialAmounts: Record<string, number> = {};
                members.forEach((m: Friend) => {
                    initialAmounts[m.id] = 0;
                });
                setExactAmounts(initialAmounts);
            });
        }
    }, [mode, selectedGroupId]);

    const handleChipClick = (chip: string) => {
        setDescription(chip);
    };

    const toggleMemberInclusion = (memberId: string) => {
        if (includedUserIds.includes(memberId)) {
            setIncludedUserIds(includedUserIds.filter(id => id !== memberId));
            // Remove from exact amounts if we wanted to cleanup, but not strictly necessary keeping it in state
        } else {
            setIncludedUserIds([...includedUserIds, memberId]);
            // Add to exact amounts with 0 if not exists
            if (exactAmounts[memberId] === undefined) {
                setExactAmounts(prev => ({ ...prev, [memberId]: 0 }));
            }
        }
    };

    const handleExactAmountChange = (memberId: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setExactAmounts(prev => ({
            ...prev,
            [memberId]: numValue
        }));
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
            formData.append("split_type", splitType);
            if (splitType === "exact") {
                formData.append("exact_amounts", JSON.stringify(exactAmounts));
            }

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

    // Exact Split Math
    const currentExactSum = includedUserIds.reduce((sum, id) => sum + (exactAmounts[id] || 0), 0);
    const difference = parsedAmount - currentExactSum;
    const isExactValid = Math.abs(difference) < 0.01; // Float tolerance

    return (
        <div className="min-h-screen bg-transparent px-4 py-6">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="-ml-2 hover:bg-white/10">
                        <ArrowLeft className="w-6 h-6 text-zinc-50" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold ml-2 text-zinc-50">Add Expense</h1>
            </div>

            {/* Mode Toggle */}
            <div className="flex p-1 bg-black/40 rounded-2xl mb-6 max-w-md mx-auto border border-white/5">
                <button
                    onClick={() => setMode("individual")}
                    className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm font-medium transition-all ${mode === "individual"
                        ? "bg-white/10 text-zinc-50 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    <User className="w-4 h-4 mr-2" />
                    Individual
                </button>
                <button
                    onClick={() => setMode("group")}
                    className={`flex-1 flex items-center justify-center py-2 rounded-xl text-sm font-medium transition-all ${mode === "group"
                        ? "bg-white/10 text-zinc-50 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    <Users className="w-4 h-4 mr-2" />
                    Group
                </button>
            </div>

            <form action={clientAction} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-8 max-w-md mx-auto">

                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider pl-1">Amount</label>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-bold text-zinc-400">₹</span>
                        <input
                            ref={amountInputRef}
                            type="number"
                            name="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="bg-black/20 border border-white/10 rounded-2xl h-20 w-full text-4xl font-bold text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 transition-all outline-none pl-12 py-2"
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
                        <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                            <span className="text-zinc-400">Paid by</span>
                            <span className="font-medium text-zinc-50">You</span>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-500 pl-1">Split with</label>
                            {loading ? (
                                <div className="h-16 w-full bg-black/20 animate-pulse rounded-2xl border border-white/10" />
                            ) : (
                                <select
                                    name="borrower_id"
                                    className="w-full h-16 px-4 bg-black/20 border border-white/10 rounded-2xl text-lg text-zinc-50 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none appearance-none"
                                    required
                                >
                                    <option value="" disabled className="text-zinc-900">Select a friend</option>
                                    {friends.map(friend => (
                                        <option key={friend.id} value={friend.id} className="text-zinc-900">
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
                            <label className="text-sm font-medium text-zinc-500 pl-1">Select Group</label>
                            <select
                                value={selectedGroupId}
                                onChange={(e) => setSelectedGroupId(e.target.value)}
                                className="w-full h-16 px-4 bg-black/20 border border-white/10 rounded-2xl text-lg text-zinc-50 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none appearance-none"
                                required
                            >
                                <option value="" disabled className="text-zinc-900">Select a group</option>
                                {groups.map(group => (
                                    <option key={group.id} value={group.id} className="text-zinc-900">
                                        {group.name}
                                    </option>
                                ))}
                            </select>

                            <div className="flex justify-end mt-2">
                                <Link href="/groups" className="text-xs flex items-center text-green-500 font-medium hover:underline">
                                    <Plus className="w-3 h-3 mr-1" />
                                    Create new group
                                </Link>
                            </div>
                        </div>

                        {/* Split Logic Container */}
                        {selectedGroupId && (
                            <>
                                {/* Split Type Toggle */}
                                <div className="flex p-1 bg-black/40 rounded-2xl max-w-sm mx-auto mb-4 border border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setSplitType("equal")}
                                        className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${splitType === "equal"
                                            ? "bg-white/10 text-zinc-50 shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        = Split Equally
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSplitType("exact")}
                                        className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${splitType === "exact"
                                            ? "bg-white/10 text-zinc-50 shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-300"
                                            }`}
                                    >
                                        ✎ Exact Amounts
                                    </button>
                                </div>

                                {/* Avatar Row & Inputs */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-zinc-500 pl-1">Tap to exclude</label>
                                    <div className="flex overflow-x-auto pb-4 pt-2 px-2 gap-4">
                                        {selectedGroupMembers.map(member => {
                                            const isIncluded = includedUserIds.includes(member.id);
                                            return (
                                                <div
                                                    key={member.id}
                                                    className="flex flex-col items-center space-y-2 cursor-pointer min-w-[72px]"
                                                    onClick={() => toggleMemberInclusion(member.id)}
                                                >
                                                    <div className="relative">
                                                        <Avatar className={`h-16 w-16 transition-all ${isIncluded ? 'ring-2 ring-green-500 ring-offset-4 ring-offset-[#09090b] opacity-100 scale-105' : 'opacity-40 grayscale border-none'}`}>
                                                            <AvatarImage src={member.avatar_url || ""} />
                                                            <AvatarFallback className="bg-white/10 text-zinc-300">{member.username?.charAt(0)}</AvatarFallback>
                                                        </Avatar>

                                                    </div>
                                                    <span className={`text-xs font-medium truncate w-full text-center ${isIncluded ? 'text-zinc-50' : 'text-zinc-500'}`}>
                                                        {member.username}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Exact Amounts Inputs */}
                                    {splitType === "exact" && (
                                        <div className="space-y-4 mt-4 px-1">
                                            {selectedGroupMembers
                                                .filter(m => includedUserIds.includes(m.id))
                                                .map(member => (
                                                    <div key={member.id} className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={member.avatar_url || ""} />
                                                                <AvatarFallback className="bg-white/10 text-zinc-300">{member.username?.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-sm font-medium text-zinc-50">
                                                                {member.username}
                                                            </span>
                                                        </div>
                                                        <div className="relative w-32">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-medium text-sm">₹</span>
                                                            <input
                                                                type="number"
                                                                value={exactAmounts[member.id] || ""}
                                                                onChange={(e) => handleExactAmountChange(member.id, e.target.value)}
                                                                onFocus={(e) => e.target.select()}
                                                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-7 pr-3 text-sm text-right text-zinc-50 focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-zinc-600"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}

                                            {/* Validation Message */}
                                            <div className="pt-2 text-center text-sm font-medium">
                                                {difference > 0.01 ? (
                                                    <span className="text-red-400">
                                                        ₹{difference.toFixed(2)} remaining to allocate
                                                    </span>
                                                ) : difference < -0.01 ? (
                                                    <span className="text-red-400">
                                                        ₹{Math.abs(difference).toFixed(2)} over-allocated!
                                                    </span>
                                                ) : (
                                                    <span className="text-green-500 flex items-center justify-center gap-1 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                                                        <Check className="w-4 h-4" /> Perfectly split!
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Equal Split Message */}
                                    {splitType === "equal" && includedUserIds.length > 0 ? (
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center backdrop-blur-sm">
                                            <p className="text-zinc-200 font-medium text-sm">
                                                Splitting ₹{parsedAmount.toLocaleString()} between {splitCount} people
                                            </p>
                                            <p className="text-green-400 font-medium text-xs mt-1">
                                                Since you paid, you'll be owed ₹{splitAmount} from each.
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Description */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-500 pl-1">For</label>
                    <Input
                        name="description"
                        placeholder="What's this for?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="bg-black/20 border border-white/10 rounded-2xl h-16 text-lg text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-green-500 focus-visible:border-green-500 transition-all"
                    />

                    {/* Quick Chips */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {QUICK_CHIPS.map(chip => {
                            const word = chip.split(" ")[1];
                            const isActive = description === word;
                            return (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => handleChipClick(word)}
                                    className={`transition-colors text-sm ${isActive
                                            ? "bg-green-500 text-black font-semibold rounded-full px-5 py-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] border-none"
                                            : "bg-white/5 text-zinc-400 border border-white/10 rounded-full px-5 py-2 hover:bg-white/10"
                                        }`}
                                >
                                    {chip}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Submit */}
                <div className="pt-4 pb-2">
                    <SubmitButton disabled={
                        (mode === "group" && includedUserIds.length === 0) ||
                        (mode === "group" && splitType === "exact" && !isExactValid)
                    } />
                </div>

            </form>
        </div>
    );
}
