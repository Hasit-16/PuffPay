

import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import BalanceCard from "@/components/dashboard/BalanceCard";
import DashboardClientView from "./DashboardClientView";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import { getDashboardData } from "./actions";

export default async function Dashboard() {
    const data = await getDashboardData();

    if (!data) {
        // Handle unauthenticated or error state gracefully
        // In a real app, middleware should catch this, but just in case
        return <div className="p-4 text-center text-red-500">Failed to load data. Please log in.</div>;
    }

    const { username, userBalance, totalToPay, totalToReceive, friendList } = data;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* 1. Sticky Top Bar */}
            <TopBar />

            <main className="px-4 py-6 space-y-8">
                <DashboardGreeting username={username} />
                {/* 2. Balance Card */}
                <section>
                    <BalanceCard
                        netBalance={userBalance}
                        toPay={totalToPay}
                        toReceive={totalToReceive}
                    />
                </section>

                {/* 3. Friends List & Controls */}
                <DashboardClientView initialFriends={friendList} />
            </main>

            {/* 4. Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
