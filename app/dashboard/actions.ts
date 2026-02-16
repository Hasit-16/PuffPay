
"use server";

import { createClient } from "@/lib/supabase/server";
import { Friendship, Transaction, Profile } from "@/types";

export interface FriendWithBalance {
    id: string; // The friend's profile ID
    name: string;
    avatar?: string;
    balance: number; // + means they owe you, - means you owe them
    is_favorite: boolean;
}

export interface DashboardData {
    userBalance: number;
    totalToPay: number;
    totalToReceive: number;
    friendList: FriendWithBalance[];
}

export async function getDashboardData(): Promise<DashboardData | null> {
    const supabase = await createClient();

    // 1. Get Current User
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const userId = user.id;

    // 2. Fetch Friends (Accepted only)
    // We need to get the profile of the *other* person in the friendship
    const { data: friendshipsData, error: friendsError } = await supabase
        .from("friendships")
        .select(
            `
      id,
      user_id,
      friend_id,
      status,
      is_favorite,
      friend:profiles!friendships_friend_id_fkey(id, username, avatar_url)
    `
        )
        .eq("status", "accepted")
        .eq("user_id", userId);

    if (friendsError) {
        console.error("Error fetching friends:", friendsError);
        // Return empty data on error to avoid crashing the page, or handle differently
        return { userBalance: 0, totalToPay: 0, totalToReceive: 0, friendList: [] };
    }

    // 3. Fetch Transactions (Where user is involved)
    const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .or(`payer_id.eq.${userId},borrower_id.eq.${userId}`)
        .neq("status", "rejected"); // Exclude rejected, include pending/paid/confirmed

    if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        return { userBalance: 0, totalToPay: 0, totalToReceive: 0, friendList: [] };
    }

    const transactions = transactionsData as Transaction[];

    // 4. Calculate Totals via Map for O(n) access
    // Map<FriendID, Balance>
    const friendBalances = new Map<string, number>();

    let totalToPay = 0;
    let totalToReceive = 0;

    transactions.forEach((t) => {
        // If status is 'settled' or 'paid' (legacy), balance effect is 0 (we ignore it).
        // 'pending' and 'confirming' both count as active debt.

        if (t.status === 'settled' || t.status === 'rejected' || t.status === 'paid') return;

        const amount = Number(t.amount);

        if (t.payer_id === userId) {
            // You paid, so you are owed money (+)
            totalToReceive += amount;

            // The borrower owes you
            if (t.borrower_id) {
                const current = friendBalances.get(t.borrower_id) || 0;
                friendBalances.set(t.borrower_id, current + amount);
            }

        } else if (t.borrower_id === userId) {
            // You borrowed, so you owe money (-)
            totalToPay += amount;

            // You owe the payer
            if (t.payer_id) {
                const current = friendBalances.get(t.payer_id) || 0;
                friendBalances.set(t.payer_id, current - amount);
            }
        }
    });

    const netBalance = totalToReceive - totalToPay;

    // 5. Format Friend List
    // We only fetched WHERE user_id = me, so friend is always the 'friend' relation.
    const friendList: FriendWithBalance[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (friendshipsData as any[]).forEach((f) => {
        const otherProfile = f.friend;

        if (otherProfile) {
            friendList.push({
                id: otherProfile.id,
                name: otherProfile.username || "Unknown",
                avatar: otherProfile.avatar_url || "",
                balance: friendBalances.get(otherProfile.id) || 0,
                is_favorite: f.is_favorite || false
            });
        }
    });

    return {
        userBalance: netBalance,
        totalToPay,
        totalToReceive,
        friendList,
    };
}
