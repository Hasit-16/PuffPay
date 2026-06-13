"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { bulkInitiateSettlement } from "@/app/settle/actions";

interface SettleButtonProps {
    friendId: string;
}

export default function SettleButton({ friendId }: SettleButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSettle = async () => {
        setIsLoading(true);
        try {
            await bulkInitiateSettlement(friendId);
        } catch (error) {
            console.error("Error during bulk settlement:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSettle}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-400 text-zinc-950 font-bold text-lg rounded-xl py-6 mt-8 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all flex items-center justify-center active:scale-95 duration-200"
        >
            {isLoading ? "Processing..." : "I Have Paid This"}
        </Button>
    );
}
