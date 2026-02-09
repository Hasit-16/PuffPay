"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface SettlementDetails {
    friend: {
        id: string;
        username: string | null;
        avatar_url: string | null;
    };
    balance: number; // Positive = They owe me, Negative = I owe them
}

export async function getSettlementDetails(friendId: string): Promise<SettlementDetails | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // 1. Get Friend Profile
    const { data: friendProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", friendId)
        .single();

    if (profileError || !friendProfile) {
        console.error("Error fetching friend profile:", profileError);
        return null;
    }

    // 2. Calculate Balance (Sum of pending transactions)
    // We fetch all pending transactions between these two users
    const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("amount, payer_id, borrower_id")
        .or(`and(payer_id.eq.${user.id},borrower_id.eq.${friendId}),and(payer_id.eq.${friendId},borrower_id.eq.${user.id})`)
        .eq("status", "pending");

    if (txError) {
        console.error("Error fetching transactions for settlement:", txError);
        return null; // Or return 0 balance?
    }

    let balance = 0;

    transactions.forEach((t) => {
        const amount = Number(t.amount);
        if (t.payer_id === user.id) {
            // I paid -> They owe me (+)
            balance += amount;
        } else {
            // They paid -> I owe them (-)
            balance -= amount;
        }
    });

    return {
        friend: friendProfile,
        balance: balance,
    };
}

export async function recordPayment(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const friendId = formData.get("friendId") as string;
    const amount = Number(formData.get("amount"));
    const direction = formData.get("direction") as "pay" | "receive"; // 'pay' (I pay them) or 'receive' (They pay me)

    if (!friendId || !amount || amount <= 0) {
        return { error: "Invalid payment details" };
    }

    // Logic: A settlement is just a transaction that opposes the balance.
    // If I owe them (Balance is negative), I 'pay' them.
    // This means I (payer) give money to them. 
    // Wait, in our system:
    // Payer = Person who met the expense. Borrower = Person who owes.
    // If I PAY them back, I am behaving like the "Payer" of a transaction where they are the "Borrower"? 
    // NO. If I pay them, I am satisfying a debt.
    //
    // Let's think about the ledger.
    // If I owe 50 (Balance -50). This comes from them paying 50 for me (Payer=Them, Borrower=Me).
    // To settle, I pay 50 to them.
    // If I record this as: Payer=Me, Borrower=Them, Amount=50.
    // Then Balance becomes: -50 + 50 = 0. Correct.

    // So:
    // If direction 'pay' (I pay them): Payer = Me, Borrower = Them.
    // If direction 'receive' (They pay me): Payer = Them, Borrower = Me.

    let payer_id, borrower_id;

    if (direction === "pay") {
        payer_id = user.id;
        borrower_id = friendId;
    } else {
        payer_id = friendId;
        borrower_id = user.id;
    }

    const { error } = await supabase.from("transactions").insert({
        payer_id: payer_id,
        borrower_id: borrower_id,
        amount: amount,
        description: "Payment / Settlement",
        status: "pending", // technically it's a new transaction that cancels the old ones.
        // In a more complex app, we might mark old ones as 'paid', but 'ledger' style is simpler for now.
    });

    if (error) {
        console.error("Record payment error:", error);
        return { error: "Failed to record payment" };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/settle/${friendId}`);
    redirect("/dashboard");
}
