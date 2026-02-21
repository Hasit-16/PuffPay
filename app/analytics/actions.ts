"use server";

import { createClient } from "@/lib/supabase/server";

export interface CategoryData {
    name: string;
    value: number;
}

export interface FriendshipData {
    name: string;
    "I Owe": number;
    "They Owe Me": number;
}

export interface MonthlyData {
    month: string;
    spending: number;
}

export interface AnalyticsPayload {
    categories: CategoryData[];
    friendships: FriendshipData[];
    monthly: MonthlyData[];
}

// Simple helper to derive category from description
function deriveCategory(desc: string | null): string {
    if (!desc) return "Other";
    const Ldesc = desc.toLowerCase();

    if (Ldesc.includes("chai") || Ldesc.includes("coffee") || Ldesc.includes("tea")) return "Drinks";
    if (Ldesc.includes("burger") || Ldesc.includes("pizza") || Ldesc.includes("food") || Ldesc.includes("lunch") || Ldesc.includes("dinner") || Ldesc.includes("sushi")) return "Food";
    if (Ldesc.includes("cab") || Ldesc.includes("uber") || Ldesc.includes("ola") || Ldesc.includes("auto") || Ldesc.includes("flight") || Ldesc.includes("train")) return "Transport";
    if (Ldesc.includes("movie") || Ldesc.includes("ticket") || Ldesc.includes("show") || Ldesc.includes("game")) return "Entertainment";
    if (Ldesc.includes("rent") || Ldesc.includes("bill") || Ldesc.includes("electricity") || Ldesc.includes("wifi") || Ldesc.includes("internet")) return "Utilities";
    if (Ldesc.includes("grocery") || Ldesc.includes("mart") || Ldesc.includes("supermarket") || Ldesc.includes("store")) return "Groceries";
    if (Ldesc.includes("puff") || Ldesc.includes("smoke") || Ldesc.includes("cig")) return "Smokes";

    return "Other";
}

export async function getAnalyticsData(): Promise<AnalyticsPayload | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Fetch all transactions involving user
    const { data: transactions, error } = await supabase
        .from("transactions")
        .select(`
            id, amount, description, status, created_at, payer_id, borrower_id,
            payer:profiles!transactions_payer_id_fkey(id, username),
            borrower:profiles!transactions_borrower_id_fkey(id, username)
        `)
        .or(`payer_id.eq.${user.id},borrower_id.eq.${user.id}`)
        .neq("status", "rejected");

    if (error || !transactions) {
        console.error("Failed to fetch analytics data", error);
        return null;
    }

    // 1. Process Category Data (Only for what I PAID for others or myself)
    // Actually, "Total Spent" = transactions where I am the borrower? No, if I am the borrower, I incurred an expense.
    // If I am the payer, I paid for someone else. My "true" expense is what I owe, or what I paid.
    // Let's track expenses where I am the borrower (meaning I consumed the good/service, so it's my expense).
    const categoryMap: Record<string, number> = {};

    // 2. Process Friendship Graph
    const friendshipMap: Record<string, FriendshipData> = {};

    // 3. Process Monthly Trend
    const monthlyMap: Record<string, number> = {};

    // Get last 6 months labels
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
        monthlyMap[monthLabel] = 0;
    }

    transactions.forEach((t) => {
        const amount = Number(t.amount);
        const isPayer = t.payer_id === user.id;
        const isBorrower = t.borrower_id === user.id;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const otherParty = isPayer ? (t.borrower as any) : (t.payer as any);
        const friendId = otherParty?.id;
        const friendName = otherParty?.username || "Unknown";

        // Chart 1 & Chart 3: Expenses (I am the borrower -> I owe money -> My actual consumption)
        // Or if I paid for a group expense, part of it is my consumption (not tracked neatly in our DB, we track I/O).
        // Let's use "I am the borrower" to represent "Money I spent/owed".
        if (isBorrower) {
            const cat = deriveCategory(t.description);
            categoryMap[cat] = (categoryMap[cat] || 0) + amount;

            const date = new Date(t.created_at);
            const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
            if (monthlyMap[monthLabel] !== undefined) {
                monthlyMap[monthLabel] += amount;
            }
        }

        // Chart 2: Friendship Graph
        // Only active debts (pending/confirming)
        if (t.status === 'pending' || t.status === 'confirming') {
            if (friendId && friendId !== user.id) {
                if (!friendshipMap[friendId]) {
                    friendshipMap[friendId] = { name: friendName, "I Owe": 0, "They Owe Me": 0 };
                }

                if (isPayer) { // They owe me
                    friendshipMap[friendId]["They Owe Me"] += amount;
                } else if (isBorrower) { // I owe them
                    friendshipMap[friendId]["I Owe"] += amount;
                }
            }
        }
    });

    const categories = Object.keys(categoryMap).map(k => ({ name: k, value: categoryMap[k] })).sort((a, b) => b.value - a.value);
    // Filter out friends with 0 balance both ways
    const friendships = Object.values(friendshipMap).filter(f => f["I Owe"] > 0 || f["They Owe Me"] > 0);
    const monthly = Object.keys(monthlyMap).map(k => ({ month: k, spending: monthlyMap[k] }));

    return {
        categories,
        friendships,
        monthly
    };
}
