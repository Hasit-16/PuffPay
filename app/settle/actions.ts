"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ==========================================
// 🔔 HELPER: SEND PUSH NOTIFICATION 🔔
// ==========================================
async function sendNotification(targetUserId: string, title: string, body: string) {
    try {
        const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        await fetch(`${appUrl}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId, title, body })
        });
    } catch (error) {
        console.error("Failed to send push notification:", error);
    }
}
// ==========================================

export async function initiateSettlement(transactionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // MODIFIED: We also need to select "payer_id" so we know who to send the notification to!
    const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("payer_id, borrower_id, status")
        .eq("id", transactionId)
        .single();

    if (fetchError || !transaction) throw new Error("Transaction not found");
    if (transaction.borrower_id !== user.id) throw new Error("Only the borrower can initiate settlement");
    if (transaction.status !== 'pending') throw new Error("Transaction is not in pending state");

    const { error } = await supabase
        .from("transactions")
        .update({ status: 'confirming' })
        .eq("id", transactionId);

    if (error) {
        console.error("Error initiating settlement:", error);
        throw new Error("Failed to initiate settlement");
    }

    // 🔔 NOTIFY THE LENDER: "Someone paid you, please confirm!"
    await sendNotification(
        transaction.payer_id,
        "💰 Payment Received!",
        "A friend just paid you. Please confirm it in the app."
    );

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    revalidatePath(`/settle/${transactionId}`);
}

export async function approveSettlement(transactionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("payer_id, borrower_id, status, created_at")
        .eq("id", transactionId)
        .single();

    if (fetchError || !transaction) throw new Error("Transaction not found");
    if (transaction.payer_id !== user.id) throw new Error("Only the lender can approve settlement");
    if (transaction.status !== 'confirming') throw new Error("Transaction is not in confirming state");

    const settledAt = new Date();
    const { error } = await supabase
        .from("transactions")
        .update({ status: 'settled', settled_at: settledAt.toISOString() })
        .eq("id", transactionId);

    if (error) {
        console.error("Error approving settlement:", error);
        throw new Error("Failed to approve settlement");
    }

    // 🔔 NOTIFY THE BORROWER: "Your payment was accepted!"
    await sendNotification(
        transaction.borrower_id,
        "✅ Payment Confirmed",
        "Your friend confirmed your payment. You're settled up!"
    );

    revalidatePath("/dashboard");
    revalidatePath("/activity");
}

export async function rejectSettlement(transactionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("payer_id, borrower_id, status") // Added borrower_id
        .eq("id", transactionId)
        .single();

    if (fetchError || !transaction) throw new Error("Transaction not found");
    if (transaction.payer_id !== user.id) throw new Error("Only the lender can reject settlement");

    const { error } = await supabase
        .from("transactions")
        .update({ status: 'pending' })
        .eq("id", transactionId);

    if (error) {
        console.error("Error rejecting settlement:", error);
        throw new Error("Failed to reject settlement");
    }

    // 🔔 NOTIFY THE BORROWER: "Payment rejected!"
    await sendNotification(
        transaction.borrower_id,
        "❌ Payment Rejected",
        "Your friend rejected your settlement request. Please check with them."
    );

    revalidatePath("/dashboard");
    revalidatePath("/activity");
}

export async function settleAllTransactions(friendId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("transactions")
        .update({ status: 'confirming' })
        .eq("borrower_id", user.id)
        .eq("payer_id", friendId)
        .eq("status", "pending");

    if (error) {
        console.error("Error settling all transactions:", error);
        throw new Error("Failed to settle transactions");
    }

    // 🔔 NOTIFY THE LENDER
    await sendNotification(
        friendId,
        "💰 Bulk Payment Received!",
        "A friend just paid off all their pending debts to you. Please confirm!"
    );

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    revalidatePath(`/settle/${friendId}`);
}

export async function approveAllSettlements(friendId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const settledAt = new Date();
    const { error } = await supabase
        .from("transactions")
        .update({ status: 'settled', settled_at: settledAt.toISOString() })
        .eq("payer_id", user.id)
        .eq("borrower_id", friendId)
        .eq("status", 'confirming');

    if (error) {
        console.error("Error approving all settlements:", error);
        throw new Error("Failed to approve settlements");
    }

    // 🔔 NOTIFY THE BORROWER
    await sendNotification(
        friendId,
        "✅ All Payments Confirmed",
        "Your friend confirmed all your payments. You are completely settled up!"
    );

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    revalidatePath(`/settle/${friendId}`);
}

export async function rejectAllSettlements(friendId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("transactions")
        .update({ status: 'pending' })
        .eq("payer_id", user.id)
        .eq("borrower_id", friendId)
        .eq("status", 'confirming');

    if (error) {
        console.error("Error rejecting all settlements:", error);
        throw new Error("Failed to reject settlements");
    }

    // 🔔 NOTIFY THE BORROWER
    await sendNotification(
        friendId,
        "❌ Bulk Payment Rejected",
        "Your friend rejected your bulk settlement. Please check with them."
    );

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    revalidatePath(`/settle/${friendId}`);
}