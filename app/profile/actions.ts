"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const username = formData.get("username") as string;
    const avatar_url = formData.get("avatar_url") as string;

    // Simple validation
    if (!username || username.length < 3) return { error: "Username must be at least 3 chars" };

    const { error } = await supabase
        .from("profiles")
        .update({ username, avatar_url })
        .eq("id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard"); // Sidebar avatar might change
    return { success: true };
}

export async function deactivateAccount() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Initialize Admin Client to bypass RLS and delete from auth.users
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // Explicit Cascading Deletes - Must be done sequentially to avoid FK constraints

        // 1. Delete friendships where the user is either the requester or the friend
        const { error: friendErr } = await supabaseAdmin.from('friendships').delete().or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
        if (friendErr) throw new Error(`Friendships cleanup failed: ${friendErr.message}`);

        // 2. Delete transactions where the user is either the payer or the borrower
        const { error: transErr } = await supabaseAdmin.from('transactions').delete().or(`payer_id.eq.${user.id},borrower_id.eq.${user.id}`);
        if (transErr) throw new Error(`Transactions cleanup failed: ${transErr.message}`);

        // 3. Remove user from all groups they are a member of
        const { error: gmErr } = await supabaseAdmin.from('group_members').delete().eq('user_id', user.id);
        if (gmErr) throw new Error(`Group memberships cleanup failed: ${gmErr.message}`);

        // 4. Delete groups the user created (this natively cascades to other group_members)
        const { error: groupsErr } = await supabaseAdmin.from('groups').delete().eq('created_by', user.id);
        if (groupsErr) throw new Error(`Groups cleanup failed: ${groupsErr.message}`);

        // 5. Delete the public profile record
        const { error: profileErr } = await supabaseAdmin.from('profiles').delete().eq('id', user.id);
        if (profileErr) throw new Error(`Profile cleanup failed: ${profileErr.message}`);

        // 6. Completely wipe from Supabase Auth
        const { error: adminAuthError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (adminAuthError) {
            console.error("Auth deletion failed:", adminAuthError);
            return { error: adminAuthError.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error("Hard delete cascade error:", error);
        return { error: error.message || "Failed to cascade delete user data" };
    }
}

export async function getProfile() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (!data) return null;

    return {
        ...data,
        email: user.email
    };
}
