"use server";

import { createClient } from "@/lib/supabase/server";

export interface ActivityItem {
    id: string;
    amount: number;
    description: string;
    created_at: string;
    type: "paid" | "borrowed"; // paid = money out, borrowed = money in
    otherPerson: {
        id: string;
        username: string | null;
        avatar_url: string | null;
    };
}

export interface GroupedActivity {
    [date: string]: ActivityItem[];
}

export async function getActivityLog(): Promise<GroupedActivity> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return {};

    // Fetch transactions where user is involved
    const { data: transactions, error } = await supabase
        .from("transactions")
        .select(`
            id,
            amount,
            description,
            created_at,
            payer_id,
            borrower_id,
            payer:profiles!transactions_payer_id_fkey(id, username, avatar_url),
            borrower:profiles!transactions_borrower_id_fkey(id, username, avatar_url)
        `)
        .or(`payer_id.eq.${user.id},borrower_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching activity:", error);
        return {};
    }

    const grouped: GroupedActivity = {};

    // Process and group
    transactions.forEach((t) => {
        const isPayer = t.payer_id === user.id;

        // If I am Payer: I paid money. Money Out.
        // If I am Borrower: I received value/money. Money In.
        const type = isPayer ? "paid" : "borrowed";

        // The "Other Person" is the one who is NOT me.
        // If I am Payer, other is Borrower.
        // If I am Borrower, other is Payer.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const otherPerson = isPayer ? (t.borrower as any) : (t.payer as any);

        if (!otherPerson) return; // Should not happen if data integrity is good

        const dateObj = new Date(t.created_at);
        const dateKey = getDateLabel(dateObj);

        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }

        grouped[dateKey].push({
            id: t.id,
            amount: Number(t.amount),
            description: t.description || "Expense",
            created_at: t.created_at,
            type,
            otherPerson: {
                id: otherPerson.id,
                username: otherPerson.username,
                avatar_url: otherPerson.avatar_url,
            },
        });
    });

    return grouped;
}

function getDateLabel(date: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
}

function isSameDay(d1: Date, d2: Date) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}
