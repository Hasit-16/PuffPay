import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import GroupDetailsClient from "./GroupDetailsClient";
import { getGroupMembers } from "@/app/groups/list_actions";
import { getMyFriends } from "@/app/friends/actions";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { id } = await params;

    // 1. Fetch Group Details
    const { data: group, error } = await supabase
        .from("groups")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !group) {
        console.error("Error fetching group:", error);
        notFound();
    }

    // 2. Fetch Members
    const members = await getGroupMembers(id);

    // 3. Fetch Available Friends
    const friends = await getMyFriends();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <TopBar />

            <main className="px-4 py-6 max-w-2xl mx-auto">
                <div className="mb-4">
                    <Link href="/friends?tab=groups">
                        <Button variant="ghost" size="sm" className="pl-0 hover:bg-transparent hover:text-slate-900 dark:hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Groups
                        </Button>
                    </Link>
                </div>

                <div className="mb-6">
                    <GroupDetailsClient
                        group={group}
                        members={members}
                        currentUserId={user.id}
                        availableFriends={friends}
                    />
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
