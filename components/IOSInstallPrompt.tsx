"use client";

import { useEffect, useState } from "react";
import { Share } from "lucide-react";

export default function IOSInstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Run detection on client mount
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        const inStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone);

        setIsIOS(isIosDevice);
        setIsStandalone(!!inStandalone);

        // If it's iOS and NOT already installed as an app, show the prompt
        if (isIosDevice && !inStandalone) {
            setShowPrompt(true);
        }
    }, []);

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] w-full p-4 animate-in slide-in-from-bottom-full duration-500 pb-8 rounded-t-3xl bg-white/10 backdrop-blur-xl border-t border-white/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="max-w-md mx-auto flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-1.5 bg-white/20 rounded-full mb-2"></div>
                <h3 className="text-lg font-bold text-zinc-50 tracking-tight">
                    Install PuffPay
                </h3>
                <p className="text-sm text-zinc-300">
                    Get the native app experience. Tap the <Share className="w-4 h-4 inline-block mx-1 -mt-1 text-blue-400" /> Share button below and select <strong>&quot;Add to Home Screen&quot;</strong>.
                </p>
                <button
                    onClick={() => setShowPrompt(false)}
                    className="mt-4 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}
