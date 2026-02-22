"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function initiateSettlement(transactionId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify ownership (Must be borrower to initiate payment)
    const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("borrower_id, status")
        .eq("id", transactionId)
        .single();

    if (fetchError || !transaction) throw new Error("Transaction not found");

    if (transaction.borrower_id !== user.id) {
        throw new Error("Only the borrower can initiate settlement");
    }

    if (transaction.status !== 'pending') {
        throw new Error("Transaction is not in pending state");
    }

    const { error } = await supabase
        .from("transactions")
        .update({ status: 'confirming' })
        .eq("id", transactionId);

    if (error) {
        console.error("Error initiating settlement:", error);
        throw new Error("Failed to initiate settlement");
    }

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    revalidatePath(`/settle/${transactionId}`);

}

export async function approveSettlement(transactionId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify ownership (Must be lender to approve)
    const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("payer_id, borrower_id, status, created_at")
        .eq("id", transactionId)
        .single();

    if (fetchError || !transaction) throw new Error("Transaction not found");

    if (transaction.payer_id !== user.id) {
        throw new Error("Only the lender can approve settlement");
    }

    if (transaction.status !== 'confirming') {
        throw new Error("Transaction is not in confirming state");
    }

    const settledAt = new Date();
    const { error } = await supabase
        .from("transactions")
        .update({ status: 'settled', settled_at: settledAt.toISOString() }) // Updated to set settled_at
        .eq("id", transactionId);

    if (error) {
        console.error("Error approving settlement:", error);
        throw new Error("Failed to approve settlement");
    }

    revalidatePath("/dashboard");
    revalidatePath("/activity");

}

export async function rejectSettlement(transactionId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify ownership (Must be lender to reject)
    const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("payer_id, status")
        .eq("id", transactionId)
        .single();

    if (fetchError || !transaction) throw new Error("Transaction not found");

    if (transaction.payer_id !== user.id) {
        throw new Error("Only the lender can reject settlement");
    }

    const { error } = await supabase
        .from("transactions")
        .update({ status: 'pending' }) // Revert to pending
        .eq("id", transactionId);

    if (error) {
        console.error("Error rejecting settlement:", error);
        throw new Error("Failed to reject settlement");
    }

    revalidatePath("/dashboard");
    revalidatePath("/activity");

}

export async function settleAllTransactions(friendId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("transactions")
        .update({ status: 'confirming' })
        .eq("borrower_id", user.id)
        // Correct query logic: transactions where *I* am the borrower and *Friend* is the payer
        .eq("payer_id", friendId)
        .eq("status", "pending");

    if (error) {
        console.error("Error settling all transactions:", error);
        throw new Error("Failed to settle transactions");
    }

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    revalidatePath(`/settle/${friendId}`);

}

export async function approveAllSettlements(friendId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Fetch the transactions we are about to approve
    const { data: transactionsToApprove } = await supabase
        .from("transactions")
        .select("id, created_at")
        .eq("payer_id", user.id)
        .eq("borrower_id", friendId)
        .eq("status", "confirming");

    const settledAt = new Date();
    const { error } = await supabase
        .from("transactions")
        .update({ status: 'settled', settled_at: settledAt.toISOString() })
        .eq("payer_id", user.id) // I am the Lender approving
        .eq("borrower_id", friendId)
        .eq("status", 'confirming');

    if (error) {
        console.error("Error approving all settlements:", error);
        throw new Error("Failed to approve settlements");
    }

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    revalidatePath(`/settle/${friendId}`);

}

export async function rejectAllSettlements(friendId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("transactions")
        .update({ status: 'pending' })
        .eq("payer_id", user.id) // I am the Lender rejecting
        .eq("borrower_id", friendId)
        .eq("status", 'confirming');

    if (error) {
        console.error("Error rejecting all settlements:", error);
        throw new Error("Failed to reject settlements");
    }

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    revalidatePath(`/settle/${friendId}`);

}
