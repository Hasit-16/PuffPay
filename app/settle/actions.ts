"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Borrower initiates settlement -> Status: confirming
export async function initiateSettlement(transactionId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify ownership and that user is the BORROWER
    const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("borrower_id, status")
        .eq("id", transactionId)
        .single();

    if (fetchError || !transaction) throw new Error("Transaction not found");

    if (transaction.borrower_id !== user.id) {
        throw new Error("Only the borrower can initiate settlement");
    }

    if (transaction.status !== "pending") {
        throw new Error("Transaction must be pending to settle");
    }

    const { error } = await supabase
        .from("transactions")
        .update({ status: "confirming" })
        .eq("id", transactionId);

    if (error) throw new Error("Failed to initiate settlement");

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    revalidatePath(`/settle/${transactionId}`);
    return { success: true };
}

// Lender approves settlement -> Status: settled
export async function approveSettlement(transactionId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify ownership and that user is the PAYER (Lender)
    const { data: transaction, error: fetchError } = await supabase
        .from("transactions")
        .select("payer_id, status")
        .eq("id", transactionId)
        .single();

    if (fetchError || !transaction) throw new Error("Transaction not found");

    if (transaction.payer_id !== user.id) {
        throw new Error("Only the lender can approve settlement");
    }

    if (transaction.status !== "confirming") {
        throw new Error("Transaction must be in confirming state to approve");
    }

    const { error } = await supabase
        .from("transactions")
        .update({ status: "settled" })
        .eq("id", transactionId);

    if (error) throw new Error("Failed to approve settlement");

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    return { success: true };
}

// Lender rejects settlement -> Status: pending
export async function rejectSettlement(transactionId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Verify ownership and that user is the PAYER (Lender)
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
        .update({ status: "pending" })
        .eq("id", transactionId);

    if (error) throw new Error("Failed to reject settlement");

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    return { success: true };
}
