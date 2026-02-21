import { Transaction } from "@/types";

export interface PuffScoreDetails {
    score: number;
    badge: string;
}

export function calculatePuffScore(transactions: Transaction[], userId: string): PuffScoreDetails {
    let score = 500; // Base score

    if (!transactions || transactions.length === 0) {
        return { score, badge: "⚪" };
    }

    const now = new Date();

    transactions.forEach(t => {
        // Did they initiate the expense? (They paid for everyone)
        if (t.payer_id === userId) {
            score += 5;
        }

        // If they are the borrower, judge how fast they pay back
        if (t.borrower_id === userId) {
            const createdAt = new Date(t.created_at);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const settledAtStr = (t as any).settled_at;

            if (t.status === 'settled' && settledAtStr) {
                const settledAt = new Date(settledAtStr);

                // Same calendar day
                if (
                    createdAt.getFullYear() === settledAt.getFullYear() &&
                    createdAt.getMonth() === settledAt.getMonth() &&
                    createdAt.getDate() === settledAt.getDate()
                ) {
                    score += 15;
                } else {
                    const daysDiff = (settledAt.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
                    if (daysDiff <= 3) {
                        score += 5;
                    } else if (daysDiff > 7) {
                        score -= 10;
                    }
                }
            } else if (t.status === 'pending' || t.status === 'confirming') {
                const pendingDays = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
                if (pendingDays > 14) {
                    score -= 20;
                } else if (pendingDays > 7) {
                    score -= 10;
                }
            }
        }
    });

    let badge = "⚪"; // Default
    if (score >= 800) badge = "💎";
    else if (score >= 600) badge = "🥇";
    else if (score >= 400) badge = "🥈";

    return { score, badge };
}
