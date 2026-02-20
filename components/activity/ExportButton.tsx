"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ActivityItem {
    id: string;
    amount: number;
    description: string;
    created_at: string;
    status: string;
    type: "paid" | "borrowed";
    otherPerson: {
        id: string;
        username: string | null;
        avatar_url: string | null;
    };
}

export default function ExportButton({ transactions }: { transactions: ActivityItem[] }) {
    const downloadCSV = () => {
        const headers = ["Date", "Description", "Friend/Group", "Who Paid", "My Share", "Action", "Status"];

        const rows = transactions.map(t => {
            const date = new Date(t.created_at);
            // Format as DD-MMM-YYYY (e.g., 20-Feb-2026)
            const dateStr = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).replace(/ /g, '-');

            const friendName = t.otherPerson?.username || 'Unknown';
            const whoPaid = t.type === 'paid' ? 'Me' : friendName;
            const action = t.type === 'borrowed' ? 'I Owe' : 'They Owe Me';

            return [
                dateStr,
                `"${t.description.replace(/"/g, '""')}"`, // escape quotes in description
                `"${friendName}"`,
                `"${whoPaid}"`,
                t.amount.toString(),
                action,
                t.status
            ].join(",");
        });

        const csvString = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "PuffPay_History.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Button variant="outline" onClick={downloadCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export to CSV
        </Button>
    );
}
