import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Trophy, Award, Users, BarChart3, Activity } from "lucide-react";

interface ProfileWithTransactionCount {
    id: string;
    username: string | null;
    transactions: { count: number }[];
}

export default async function AdminDashboard() {
    const supabase = await createClient();

    // 1. Security / Auth Check
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. Data Fetching (Leaderboard Logic)
    const { data: rawProfiles, error } = await supabase
        .from("profiles")
        .select("id, username, transactions!payer_id(count)") as {
            data: ProfileWithTransactionCount[] | null;
            error: any;
        };

    if (error) {
        console.error("Error fetching admin leaderboard:", error);
    }

    // Process and Map results
    const leaderboard = (rawProfiles || []).map((profile) => {
        const totalExpenses = profile.transactions?.[0]?.count ?? 0;
        return {
            id: profile.id,
            username: profile.username || `user_${profile.id.substring(0, 5)}`,
            totalExpenses,
        };
    });

    // Sort from highest totalExpenses to lowest
    const sortedLeaderboard = leaderboard.sort((a, b) => b.totalExpenses - a.totalExpenses);

    // Calculate quick stats
    const totalRegisteredUsers = leaderboard.length;
    const totalIOUsCreated = leaderboard.reduce((sum, item) => sum + item.totalExpenses, 0);
    const activeContributors = leaderboard.filter(item => item.totalExpenses > 0).length;

    return (
        <div className="min-h-screen bg-transparent pb-20">
            {/* Header / Top Navigation */}
            <header className="sticky top-0 z-40 w-full bg-white/5 backdrop-blur-md pt-[max(env(safe-area-inset-top),1.5rem)] pb-4 px-6 border-b border-white/5 flex items-center justify-between">
                <Link 
                    href="/dashboard" 
                    className="flex items-center gap-2 text-zinc-400 hover:text-zinc-50 active:scale-95 transition-all duration-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin Authorized
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
                {/* Dashboard Title */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold text-green-500 tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-green-500" />
                        PuffPay Admin HQ
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        Real-time analytics and user IOU engagement leaderboard.
                    </p>
                </div>

                {/* Metrics Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800 p-5 space-y-2">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
                            <Users className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="text-2xl font-bold text-zinc-50">{totalRegisteredUsers}</div>
                        <p className="text-[10px] text-zinc-500">Registered accounts</p>
                    </div>
                    
                    <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800 p-5 space-y-2">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-xs font-medium uppercase tracking-wider">Total IOUs</span>
                            <Activity className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="text-2xl font-bold text-green-500">{totalIOUsCreated}</div>
                        <p className="text-[10px] text-zinc-500">Active and settled debts</p>
                    </div>

                    <div className="bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-800 p-5 space-y-2">
                        <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-xs font-medium uppercase tracking-wider">Active Users</span>
                            <Award className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div className="text-2xl font-bold text-zinc-50">
                            {totalRegisteredUsers > 0 
                                ? `${((activeContributors / totalRegisteredUsers) * 100).toFixed(0)}%`
                                : "0%"
                            }
                        </div>
                        <p className="text-[10px] text-zinc-500">{activeContributors} users created IOUs</p>
                    </div>
                </div>

                {/* Leaderboard Table Container */}
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-zinc-50 tracking-tight flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            User Engagement Leaderboard
                        </h2>
                        <span className="text-xs text-zinc-500">Sorted by most IOUs created</span>
                    </div>

                    {sortedLeaderboard.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500 space-y-2">
                            <p className="text-sm">No profiles found in the system.</p>
                            <p className="text-xs text-zinc-600">Ensure users have signed up and created accounts.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider bg-zinc-950/40">
                                        <th className="py-4 px-6 w-20 text-center">Rank</th>
                                        <th className="py-4 px-6">Username</th>
                                        <th className="py-4 px-6 text-right">IOUs Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {sortedLeaderboard.map((item, index) => {
                                        const rank = index + 1;
                                        // Highlight top 3
                                        const rankColors = 
                                            rank === 1 ? "text-amber-500 bg-amber-500/5 border-amber-500/20" :
                                            rank === 2 ? "text-zinc-300 bg-zinc-300/5 border-zinc-300/20" :
                                            rank === 3 ? "text-amber-700 bg-amber-700/5 border-amber-700/20" :
                                            "text-zinc-500 bg-transparent border-transparent";

                                        return (
                                            <tr 
                                                key={item.id} 
                                                className="hover:bg-zinc-800/30 transition-colors group"
                                            >
                                                <td className="py-4 px-6 text-center font-bold">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs border ${rankColors}`}>
                                                        {rank}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-zinc-100 font-medium group-hover:text-zinc-50">
                                                    {item.username}
                                                </td>
                                                <td className="py-4 px-6 text-right font-bold text-green-500 tabular-nums">
                                                    {item.totalExpenses}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
