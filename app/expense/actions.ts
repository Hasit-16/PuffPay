"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createTransaction(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const amount = Number(formData.get("amount"));
    const description = formData.get("description") as string;
    const borrowerId = formData.get("borrower_id") as string;

    // Validation
    if (!amount || amount <= 0) {
        return { error: "Amount must be greater than 0" };
    }

    if (!borrowerId) {
        return { error: "Please select a friend to split with" };
    }

    if (!description) {
        return { error: "Description is required" };
    }

    // Insert Transaction
    // Assuming 100% split: You met the expense, they owe you.
    // Payer = Me (user.id)
    // Borrower = Friend (borrowerId)
    const { error } = await supabase.from("transactions").insert({
        payer_id: user.id,
        borrower_id: borrowerId,
        amount: amount,
        description: description,
        status: "pending",
    });

    if (error) {
        console.error("Create transaction error:", error);
        return { error: "Failed to create transaction" };
    }

    revalidatePath("/dashboard");
    redirect("/dashboard");
}
