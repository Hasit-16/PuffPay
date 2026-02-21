"use client";

import { FriendWithBalance } from "@/app/dashboard/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PuffScoreWidget({ friends }: { friends: FriendWithBalance[] }) {
    if (!friends || friends.length === 0) return null;

    // Sort by highest puffScore and take top 3
    const topFriends = [...friends].sort((a, b) => b.puffScore - a.puffScore).slice(0, 3);

    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Trustworthy Friends</h2>
            <div className="space-y-4">
                {topFriends.map((friend, idx) => (
                    <div key={friend.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="w-10 h-10 border border-slate-200 dark:border-slate-700">
                                    <AvatarImage src={friend.avatar} alt={friend.name} />
                                    <AvatarFallback>{friend.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                {idx === 0 && (
                                    <div className="absolute -top-1 -right-1 text-xs bg-yellow-400 rounded-full w-4 h-4 flex items-center justify-center border border-white dark:border-slate-900 shadow-sm">
                                        👑
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{friend.name}</h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    Trust Score: <span className="font-medium text-slate-700 dark:text-slate-300">{friend.puffScore}</span>
                                </p>
                            </div>
                        </div>
                        <div className="text-2xl" title="PuffScore Badge">
                            {friend.puffBadge}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
