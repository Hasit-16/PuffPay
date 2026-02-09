
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

    // 2. Check existing friendship status for each result
    // This is a bit N+1 but for 10 items it's fine. 
    // Optimization: Fetch all relevant friendships in one go.
    const profileIds = profiles.map(p => p.id);

    const { data: friendships } = await supabase
        .from("friendships")
        .select("user_id, friend_id, status")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .in("user_id", profileIds) // Check if they sent request
        .or(`friend_id.in.(${profileIds.join(',')})`); // Check if I sent request
    // Note: The OR logic above with .in() combined is tricky in Supabase logic constructor.
    // Simpler: Just fetch all friendships involving me and these users.

    // Actually, let's just loop for simplicity in V1 as V1 performance reqs are low.
    // ... Or better, fetch all my friendships and map them.
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
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Check if exists
    const { data: existing } = await supabase
        .from("friendships")
        .select("*")
        .or(
            `and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`
        )
        .single();

    if (existing) {
        return { error: "Friendship already exists or pending" };
    }

    const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: targetUserId,
        status: "pending",
    });

    if (error) return { error: error.message };

    revalidatePath("/friends/add");
    return { success: true };
}

export async function getFriendRequests() {
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
      created_at,
      user:public_profiles!friendships_user_id_fkey(id, username, avatar_url)
    `)
        .eq("friend_id", user.id)
        .eq("status", "pending");

    if (error) {
        console.error("Get requests error:", error);
        return [];
    }

    return data.map((item) => ({
        id: item.id, // request id
        sender: item.user,
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
            user:public_profiles!friendships_user_id_fkey(id, username, avatar_url),
            friend:public_profiles!friendships_friend_id_fkey(id, username, avatar_url)
        `)
        .eq("status", "accepted")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (error) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map(f => {
        if (f.user_id === user.id) return f.friend;
        return f.user;
    });
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
    // user_id is the original sender, friend_id is me (user.id).
    // We want to insert: user_id = me, friend_id = original sender.
    if (existingRequest) {
        const originalSenderId = existingRequest.user_id;

        // Check if reverse already exists (unlikely but good to check)
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
