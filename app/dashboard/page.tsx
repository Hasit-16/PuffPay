import TopBar from "@/components/layout/TopBar";
import BalanceCard from "@/components/dashboard/BalanceCard";
import DashboardClientView from "./DashboardClientView";
import DashboardGreeting from "@/components/dashboard/DashboardGreeting";
import { getDashboardData } from "./actions";
import NotificationBanner from "@/components/ui/NotificationBanner";

export default async function Dashboard() {
    const data = await getDashboardData();

    if (!data) {
        // Handle unauthenticated or error state gracefully
        // In a real app, middleware should catch this, but just in case
        return <div className="p-4 text-center text-red-500">Failed to load data. Please log in.</div>;
    }

    const { username, userBalance, totalToPay, totalToReceive, friendList } = data;

    return (
        <div className="min-h-screen bg-transparent pb-20">
            {/* 1. Sticky Top Bar */}
            <TopBar />

            <main className="px-4 py-6 space-y-8">
                {/* ---> BANNER ADDED HERE <--- */}
                <NotificationBanner />

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
        </div>
    );
}