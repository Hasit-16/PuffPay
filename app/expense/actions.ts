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
        // Group Split Logic
        // Total Amount = `amount`
        // Borrowers = `borrowerIds` (These are the people checked in the UI)
        // Does `borrowerIds` include ME?
        // In UI: "Default include everyone" (from group members).
        // If I am in the group, I am in `borrowerIds`.
        // If I am in `borrowerIds`, I don't owe myself.
        // So splitAmount = amount / borrowerIds.length.
        // I only create transactions for OTHER people in `borrowerIds`.

        const splitCount = borrowerIds.length;
        if (splitCount === 0) return { error: "No one to split with" }; // Should be caught above

        const splitAmount = amount / splitCount;

        // Filter out myself from borrowers (I don't pay myself)
        const others = borrowerIds.filter(id => id !== user.id);

        if (others.length === 0 && borrowerIds.includes(user.id)) {
            // I paid for myself only?
            return { error: "You cannot split an expense only with yourself" };
        }

        // Insert for each other person
        for (const borrowerId of others) {
            const err = await insertTransaction(borrowerId, splitAmount);
            if (err) {
                console.error("Error inserting transaction for", borrowerId, err);
                errorCount++;
            }
        }

    } else {
        // Individual Mode (Legacy)
        // Existing behavior: "amount" is what they owe me.
        // But wait, in the new UI for individual, I am selecting "Split with Friend A".
        // If I enter 100, does Friend A owe me 100? Or 50?
        // The previous code:
        // const amount = Number(formData.get("amount"));
        // ... insert { amount: amount }
        // So previously, input was "Amount they owe".

        // Let's keep it consistent for Individual mode if we want to support "I paid for you completely".
        // BUT "Split with" implies splitting.
        // However, standard 1-on-1 expense usually means "I paid this much for you" OR "We split this".
        // Given `app/expense/add/page.tsx` label "Amount", usually implies Total.
        // But the previous implementation logic was: `amount` from input -> `amount` in DB.
        // If I pay 100 for Lunch with A, and enter 100.
        // If DB `amount` is 100, then A owes me 100. That means I paid 200? Or I paid 100 and it was ALL for A?
        // "Quick Chips" like Chai, Sandwich imply small items.
        // Let's assume for Individual mode, sticking to previous behavior is safest to NOT BREAK Phase 15.
        // Previous behavior: Input Amount = Transaction Amount (Debt).

        // Wait, I changed the UI. The UI now says "Split with".
        // The old UI said "Paid by You, Split with [Select]".
        // Phase 15 logic: Input 100 -> Transaction 100.
        // Use Case: I bought a sandwich for Bob (100). Bob owes 100.
        // Use Case: I paid 200 for lunch for Me and Bob. Bob owes 100. User calculates 100 and enters 100.
        // Let's stick to: Individual Mode Input = Debt Amount. Use `amount` directly.

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
