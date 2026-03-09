"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ==========================================
// 🔔 HELPER: SEND PUSH NOTIFICATION 🔔
// ==========================================
async function sendNotification(targetUserId: string, title: string, body: string) {
    try {
        const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        await fetch(`${appUrl}/api/notifications/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetUserId, title, body })
        });
    } catch (error) {
        console.error("Failed to send push notification:", error);
    }
}
// ==========================================

export interface UserResult {
    id: string;
    username: string | null;
    avatar_url: string | null;
    friendship_status?: "none" | "pending" | "accepted" | "sent";
}

export async function searchUsers(query: string): Promise<UserResult[]> {
    if (!query || query.length < 3) return [];

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // 1. Search profiles
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .neq("id", user.id) // Exclude self
        .limit(10);

    if (error) {
        console.error("Search error:", error);
        return [];
    }

    const { data: myFriendships } = await supabase
        .from("friendships")
        .select("*")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    const results: UserResult[] = profiles.map((profile) => {
        let status: UserResult["friendship_status"] = "none";

        const friendship = myFriendships?.find(
            (f) =>
                (f.user_id === user.id && f.friend_id === profile.id) ||
                (f.friend_id === user.id && f.user_id === profile.id)
        );

        if (friendship) {
            if (friendship.status === "accepted") {
                status = "accepted";
            } else if (friendship.user_id === user.id) {
                status = "sent";
            } else {
                status = "pending";
            }
        }

        return {
            ...profile,
            friendship_status: status,
        };
    });

    return results;
}

export async function sendFriendRequest(targetUserId: string) {
    console.log("sendFriendRequest called with:", targetUserId);
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            console.error("sendFriendRequest: No user found");
            throw new Error("Unauthorized");
        }

        console.log("sendFriendRequest: Current user:", user.id);

        if (user.id === targetUserId) {
            return { error: "Cannot add yourself" };
        }

        // Check if exists
        const { data: existing, error: checkError } = await supabase
            .from("friendships")
            .select("*")
            .or(
                `and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`
            )
            .maybeSingle();

        if (checkError) {
            console.error("sendFriendRequest: Check error:", checkError);
            return { error: "Database check failed" };
        }

        if (existing) {
            console.log("sendFriendRequest: Friendship already exists:", existing);
            return { error: "Friendship already exists or pending" };
        }

        const { error: insertError } = await supabase.from("friendships").insert({
            user_id: user.id,
            friend_id: targetUserId,
            status: "pending",
        });

        if (insertError) {
            console.error("sendFriendRequest: Insert error:", insertError);
            return { error: insertError.message };
        }

        // 🔔 TRIGGER NOTIFICATION HERE 🔔
        await sendNotification(
            targetUserId,
            "👋 New Friend Request",
            "Someone wants to split bills with you on PuffPay!"
        );

        console.log("sendFriendRequest: Success");
        revalidatePath("/friends/add");
        return { success: true };
    } catch (err) {
        console.error("sendFriendRequest: Unexpected error:", err);
        return { error: "Unexpected server error" };
    }
}

export async function getFriendRequests() {
    console.log("getFriendRequests: called");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        console.log("getFriendRequests: No user");
        return [];
    }

    const { data, error } = await supabase
        .from("friendships")
        .select(`
      id,
      user_id,
      created_at,
      user:profiles!friendships_user_id_fkey(id, username, avatar_url)
    `)
        .eq("friend_id", user.id)
        .eq("status", "pending");

    if (error) {
        console.error("getFriendRequests error:", error);
        return [];
    }

    console.log("getFriendRequests: Data found:", data?.length);

    return data.map((item) => ({
        id: item.id, // request id
        sender: item.user,
        created_at: item.created_at,
    }));
}

export async function getSentRequests() {
    console.log("getSentRequests: called");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("friendships")
        .select(`
            id,
            friend_id,
            created_at,
            friend:profiles!friendships_friend_id_fkey(id, username, avatar_url)
        `)
        .eq("user_id", user.id)
        .eq("status", "pending");

    if (error) {
        console.error("getSentRequests error:", error);
        return [];
    }

    return data.map((item) => ({
        id: item.id,
        recipient: item.friend,
        created_at: item.created_at,
    }));
}

export async function getMyFriends() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("friendships")
        .select(`
            id,
            user_id,
            friend_id,
            is_favorite,
            created_at,
            friend:profiles!friendships_friend_id_fkey(id, username, avatar_url)
        `)
        .eq("status", "accepted")
        .eq("user_id", user.id);

    if (error) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(f => ({
        ...f.friend,
        friendship_id: f.id,
        is_favorite: f.is_favorite,
        created_at: f.created_at
    }));
}

export async function toggleFavoriteStatus(friendshipId: string, currentStatus: boolean) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from("friendships")
        .update({ is_favorite: !currentStatus })
        .eq("id", friendshipId)
        .eq("user_id", user.id); // Security: only update my own friendship record

    if (error) {
        console.error("toggleFavoriteStatus error:", error);
        return { error: error.message };
    }

    revalidatePath("/friends");
    return { success: true };
}


export async function acceptFriendRequest(requestId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // 1. Update status to accepted
    const { error, data: existingRequest } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", requestId)
        .eq("friend_id", user.id) // Security check: Ensure I am the recipient
        .select()
        .single();

    if (error) return { error: error.message };

    // 2. Insert Reverse Record (Bidirectional)
    if (existingRequest) {
        const originalSenderId = existingRequest.user_id;

        const { data: reverseCheck } = await supabase
            .from("friendships")
            .select("id")
            .match({ user_id: user.id, friend_id: originalSenderId })
            .single();

        if (!reverseCheck) {
            await supabase.from("friendships").insert({
                user_id: user.id,
                friend_id: originalSenderId,
                status: "accepted"
            });

            // 🔔 TRIGGER NOTIFICATION HERE 🔔
            // Only notify if we successfully complete the friendship loop!
            await sendNotification(
                originalSenderId,
                "🤝 Friend Request Accepted",
                "Your friend accepted your request. You can now split bills!"
            );
        }
    }

    revalidatePath("/friends");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function ignoreFriendRequest(requestId: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    await supabase
        .from("friendships")
        .delete()
        .eq("id", requestId)
        .eq("friend_id", user.id);

    revalidatePath("/friends");
}