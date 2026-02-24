"use client";

import { useEffect, useState } from "react";

const GREETINGS = [
    "Welcome back,",
    "Good to see you,",
    "Hello,",
    "Greetings,",
    "Ready to settle up,",
    "Nice to see you,"
];

export default function DashboardGreeting({ username }: { username: string }) {
    const [greeting, setGreeting] = useState("Welcome back,");

    useEffect(() => {
        const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
        setGreeting(randomGreeting);
    }, []);

    return (
        <div className="flex flex-col mb-6">
            <span className="text-xl text-zinc-400 font-medium tracking-wide">
                {greeting}
            </span>
            <span className="text-4xl font-extrabold text-zinc-50 mt-1">
                {username}
            </span>
        </div>
    );
}
