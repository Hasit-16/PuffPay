
import { cn } from "@/lib/utils";

interface TrafficLightBadgeProps {
    status: 'pending' | 'confirming' | 'settled' | 'rejected' | string;
    perspective: 'lender' | 'borrower';
    className?: string;
}

export default function TrafficLightBadge({ status, perspective, className }: TrafficLightBadgeProps) {
    let colorClass = "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    let label = status;

    if (perspective === 'borrower') {
        // I OWE MONEY
        switch (status) {
            case 'pending':
                colorClass = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800";
                label = "To Pay";
                break;
            case 'confirming':
                colorClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
                label = "Confirming";
                break;
            case 'settled':
                colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
                label = "Paid";
                break;
        }
    } else {
        // I AM OWED MONEY
        switch (status) {
            case 'pending':
                colorClass = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800";
                label = "To Receive";
                break;
            case 'confirming':
                colorClass = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800";
                label = "Review";
                break;
            case 'settled':
                colorClass = "bg-slate-100 text-slate-500";
                label = "Received";
                break;
        }
    }

    return (
        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", colorClass, className)}>
            {label}
        </span>
    );
}
