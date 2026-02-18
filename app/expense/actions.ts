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
    let borrowerIds: string[] = [];

    // Check for multiple borrowers (Group Mode)
    const borrowerIdsJson = formData.get("borrower_ids") as string;
    if (borrowerIdsJson) {
        try {
            borrowerIds = JSON.parse(borrowerIdsJson);
        } catch (e) {
            console.error("Error parsing borrower_ids:", e);
            return { error: "Invalid borrower data" };
        }
    }

    // Fallback or Individual Mode logic (if frontend sends borrower_id)
    const singleBorrowerId = formData.get("borrower_id") as string;
    if (borrowerIds.length === 0 && singleBorrowerId) {
        borrowerIds = [singleBorrowerId];
    }

    // Validation
    if (!amount || amount <= 0) {
        return { error: "Amount must be greater than 0" };
    }

    if (borrowerIds.length === 0) {
        return { error: "Please select at least one friend to split with" };
    }

    if (!description) {
        return { error: "Description is required" };
    }

    // Calculate Split
    // Total Amount = X
    // Split among N people (borrowers)
    // Wait, if I am paying 300 for 3 people (Me + A + B).
    // The "borrowers" list usually excludes ME if I am paying. 
    // In my UI logic:
    // Individual Mode: I select Friend A. I pay 100. Friend A owes me 100? Or split 50/50?
    // Current logic: "Assuming 100% split: You met the expense, they owe you." -> The input amount is what THEY owe.
    // BUT for Group Mode: "Splitting ₹300 between 2 people (₹150 each)" -> Input is TOTAL.

    // ADJUSTMENT:
    // If mode is 'individual', existing behavior was: Input Amount = Debt Amount.
    // If mode is 'group', Input Amount = Total Bill.
    // We need to know the mode or infer it?
    // The UI sends `mode` in formData.

    const mode = formData.get("mode") as string; // 'individual' | 'group'

    // Helper to insert
    const insertTransaction = async (borrowerId: string, debtAmount: number) => {
        const { error } = await supabase.from("transactions").insert({
            payer_id: user.id,
            borrower_id: borrowerId,
            amount: debtAmount,
            description: description,
            status: "pending",
        });
        return error;
    };

    let errorCount = 0;

    if (mode === 'group') {
        const splitType = formData.get("split_type") as string; // 'equal' | 'exact'

        // Group Split Logic
        // Borrowers = `borrowerIds` (These are the people checked in the UI)
        // Does `borrowerIds` include ME? - Yes, usually.

        const splitCount = borrowerIds.length;
        if (splitCount === 0) return { error: "No one to split with" }; // Should be caught above

        // Filter out myself from borrowers (I don't pay myself)
        const others = borrowerIds.filter(id => id !== user.id);

        if (others.length === 0 && borrowerIds.includes(user.id)) {
            return { error: "You cannot split an expense only with yourself" };
        }

        if (splitType === 'exact') {
            const exactAmountsJson = formData.get("exact_amounts") as string;
            let exactAmounts: Record<string, number> = {};
            try {
                exactAmounts = JSON.parse(exactAmountsJson);
            } catch (e) {
                return { error: "Invalid exact amounts data" };
            }

            // Validate total (Server side check)
            // Note: `amount` is Total Bill.
            // Sum of exactAmounts for ALL included members should be `amount`.
            // But we only create transactions for OTHERS.
            // So we iterate `others` and use their exact amount.

            // Optional: Verify sum matches total amount within tolerance?
            // The client does this, but good to be safe.
            // let totalExact = Object.values(exactAmounts).reduce((a, b) => a + b, 0);
            // if (Math.abs(totalExact - amount) > 1) { return { error: "Amounts do not match total" }; }

            for (const borrowerId of others) {
                const debtAmount = exactAmounts[borrowerId];
                if (debtAmount > 0) {
                    const err = await insertTransaction(borrowerId, debtAmount);
                    if (err) {
                        console.error("Error inserting transaction for", borrowerId, err);
                        errorCount++;
                    }
                }
            }

        } else {
            // EQUAL SPLIT
            const splitAmount = amount / splitCount;

            for (const borrowerId of others) {
                const err = await insertTransaction(borrowerId, splitAmount);
                if (err) {
                    console.error("Error inserting transaction for", borrowerId, err);
                    errorCount++;
                }
            }
        }

    } else {
        // Individual Mode (Legacy)
        for (const borrowerId of borrowerIds) {
            const err = await insertTransaction(borrowerId, amount);
            if (err) errorCount++;
        }
    }

    if (errorCount > 0) {
        return { error: "Failed to create some transactions" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/activity");
    return { success: true };
}
