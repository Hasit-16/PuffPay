
"use client";

import { Home, Users, PlusCircle, Activity, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Friends", href: "/dashboard/friends", icon: Users }, // Placeholder route
        { name: "Add", href: "/expense/add", icon: PlusCircle, isMain: true },
        { name: "Activity", href: "/activity", icon: Activity },
        { name: "Profile", href: "/profile", icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    if (item.isMain) {
                        return (
                            <Link key={item.name} href={item.href}>
                                <div className="flex flex-col items-center justify-center -mt-6">
                                    <div className="bg-green-500 rounded-full p-4 shadow-lg ring-4 ring-white dark:ring-slate-950">
                                        <Icon className="text-white w-7 h-7" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-500 mt-1">
                                        {item.name}
                                    </span>
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link key={item.name} href={item.href} className="w-full h-full flex items-center justify-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                                <Icon
                                    className={`w-6 h-6 transition-colors ${isActive
                                            ? "text-green-500"
                                            : "text-slate-400 dark:text-slate-500"
                                        }`}
                                />
                                <span
                                    className={`text-[10px] font-medium ${isActive
                                            ? "text-green-500"
                                            : "text-slate-400 dark:text-slate-500"
                                        }`}
                                >
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
