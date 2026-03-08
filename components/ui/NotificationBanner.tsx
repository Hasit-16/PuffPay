"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotificationBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 1. Did they manually dismiss it?
        const bannerDismissed = localStorage.getItem("pushBannerDismissed");

        // 2. Did they already enable notifications? 
        // (We check if 'window' exists so Next.js doesn't crash during server-side rendering)
        const isPushEnabled =
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted";

        // If it hasn't been dismissed AND notifications aren't enabled yet, show the banner!
        if (!bannerDismissed && !isPushEnabled) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("pushBannerDismissed", "true");
    };

    if (!isVisible) return null;

    return (
        <div className="bg-blue-600/10 border border-blue-500/20 text-blue-100 px-4 py-3 rounded-xl shadow-lg flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <span className="text-xl">🔔</span>
                <p className="text-sm font-medium">
                    Never miss a payment! Push notifications are now live.{" "}
                    <Link href="/profile" className="underline font-bold text-blue-400 hover:text-blue-300">
                        Enable them here
                    </Link>.
                </p>
            </div>
            <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors p-2"
                aria-label="Dismiss"
            >
                ✕
            </button>
        </div>
    );
}