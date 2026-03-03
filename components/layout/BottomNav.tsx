
"use client";

import { Home, Users, PlusCircle, Activity, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Friends", href: "/friends", icon: Users },
        { name: "Add", href: "/expense/add", icon: PlusCircle, isMain: true },
        { name: "Activity", href: "/activity", icon: Activity },
        { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <nav className="fixed bottom-[max(env(safe-area-inset-bottom),1.5rem)] left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-full bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden z-50">
            <div className="flex justify-between items-center px-6 py-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    if (item.isMain) {
                        return (
                            <Link key={item.name} href={item.href}>
                                <div className="flex items-center justify-center">
                                    <div className="bg-green-500 rounded-full p-3 shadow-[0_0_15px_rgba(34,197,94,0.4)] active:scale-90 active:bg-green-600 transition-all duration-200">
                                        <Icon className="text-white w-6 h-6" />
                                    </div>
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link key={item.name} href={item.href} className="flex items-center justify-center active:scale-95 transition-all duration-200">
                            <div className={`flex flex-col items-center justify-center gap-1 transition-all ${isActive
                                ? "bg-white/10 text-green-500 rounded-full px-4 py-2"
                                : "text-zinc-500 py-2"
                                }`}>
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">
                                    {item.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
