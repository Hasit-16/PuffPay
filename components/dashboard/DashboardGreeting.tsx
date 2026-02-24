"use client";

import { useEffect, useState } from "react";

export default function DashboardGreeting({ username }: { username: string }) {
    const [greeting, setGreeting] = useState("Good Day");

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting("Good Morning");
        } else if (hour < 17) {
            setGreeting("Good Afternoon");
        } else {
            setGreeting("Good Evening");
        }
    }, []);

    return (
        <h1 className="text-2xl font-bold text-zinc-50 mb-2 tracking-tight">
            {greeting}, {username} 👋
        </h1>
    );
}
