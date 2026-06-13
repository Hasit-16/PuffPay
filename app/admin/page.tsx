import { createClient } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Trophy, BarChart3 } from "lucide-react";

interface ProfileWithTransactionCount {
    id: string;
    username: string | null;
    transactions: { count: number }[];
}

export default async function AdminDashboard() {
    // 1. Security / Auth Check (Using your standard client)
    const supabaseAuth = await createClient();
    const {
        data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 2. 🚨 Admin Data Client (Bypasses RLS to see all users' data)
    const cookieStore = await cookies();
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    );

    // 3. Data Fetching Concurrently (Using the Admin Client!)
    const [
        profilesRes,
        transactionsRes,
        friendshipsRes,
        subscriptionsRes
    ] = await Promise.all([
        supabaseAdmin.from("profiles").select("id, username, transactions!payer_id(count)"),
        supabaseAdmin.from("transactions").select("amount, status"),
        supabaseAdmin.from("friendships").select("user_id, friend_id"),
        supabaseAdmin.from("push_subscriptions").select("user_id")
    ]);

    const rawProfiles = profilesRes.data as ProfileWithTransactionCount[] | null;
    const allTransactions = transactionsRes.data || [];
    const friendships = friendshipsRes.data || [];
    const subscriptions = subscriptionsRes.data || [];

    if (profilesRes.error) console.error("Error fetching profiles:", profilesRes.error);
    if (transactionsRes.error) console.error("Error fetching transactions:", transactionsRes.error);
    if (friendshipsRes.error) console.error("Error fetching friendships:", friendshipsRes.error);
    if (subscriptionsRes.error) console.error("Error fetching subscriptions:", subscriptionsRes.error);

    // Leaderboard calculation logic
    const leaderboard = (rawProfiles || []).map((profile) => {
        const totalExpenses = profile.transactions?.[0]?.count ?? 0;
        return {
            id: profile.id,
            username: profile.username || `user_${profile.id.substring(0, 5)}`,
            totalExpenses,
        };
    });

    // Sort leaderboard from highest totalExpenses to lowest
    const sortedLeaderboard = leaderboard.sort((a, b) => b.totalExpenses - a.totalExpenses);

    // Advanced Health Analytics Calculations
    // 1. Total Active Debt (pending or confirming status)
    const activeTransactions = allTransactions.filter(
        (tx) => tx.status === "pending" || tx.status === "confirming"
    );
    const totalActiveDebt = activeTransactions.reduce(
        (sum, tx) => sum + Number(tx.amount),
        0
    );

    // 2. Settlement Rate (percentage of settled transactions out of total)
    const totalTxCount = allTransactions.length;
    const settledTxCount = allTransactions.filter(
        (tx) => tx.status === "settled" || tx.status === "confirmed" // include 'confirmed' as legacy/active settled status if present
    ).length;
    const settlementRate = totalTxCount > 0 ? Math.round((settledTxCount / totalTxCount) * 100) : 0;

    // 3. Push Opt-in Rate (unique users in push_subscriptions / total profiles)
    const totalRegisteredUsers = rawProfiles ? rawProfiles.length : 0;
    const uniqueSubscribedUsers = subscriptions
        ? new Set(subscriptions.map((sub) => sub.user_id)).size
        : 0;
    const pushOptInRate = totalRegisteredUsers > 0
        ? Math.round((uniqueSubscribedUsers / totalRegisteredUsers) * 100)
        : 0;

    // 4. Orphaned Users (profiles whose ID does not appear in user_id or friend_id of friendships)
    const activeFriendIds = new Set<string>();
    friendships.forEach((f) => {
        if (f.user_id) activeFriendIds.add(f.user_id);
        if (f.friend_id) activeFriendIds.add(f.friend_id);
    });
    const orphanedUsersCount = rawProfiles
        ? rawProfiles.filter((p) => !activeFriendIds.has(p.id)).length
        : 0;

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

                {/* Advanced Health Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Card 1: Total Active Debt */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
                        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block">
                            Total Active Debt
                        </span>
                        <div className="text-3xl font-bold text-green-500 tabular-nums">
                            ₹{totalActiveDebt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>

                    {/* Card 2: Settlement Rate */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
                        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block">
                            Settlement Rate
                        </span>
                        <div className="text-3xl font-bold text-green-500 tabular-nums">
                            {settlementRate}%
                        </div>
                    </div>

                    {/* Card 3: Push Opt-in Rate */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
                        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block">
                            Push Opt-in Rate
                        </span>
                        <div className="text-3xl font-bold text-white tabular-nums">
                            {pushOptInRate}%
                        </div>
                    </div>

                    {/* Card 4: Orphaned Users */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-2">
                        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block">
                            Orphaned Users
                        </span>
                        <div className="text-3xl font-bold text-red-400 tabular-nums">
                            {orphanedUsersCount}
                        </div>
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