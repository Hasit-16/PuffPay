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
        // Explicit Cascading Deletes

        // 1. Remove from group_members
        await supabaseAdmin.from('group_members').delete().eq('user_id', user.id);

        // 2. Delete groups they created (Cascades to group_members by DB constraint)
        await supabaseAdmin.from('groups').delete().eq('created_by', user.id);

        // 3. Delete transactions they are part of
        await supabaseAdmin.from('transactions').delete().or(`payer_id.eq.${user.id},borrower_id.eq.${user.id}`);

        // 4. Delete friendships they are part of
        await supabaseAdmin.from('friendships').delete().or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

        // 5. Delete profile record
        await supabaseAdmin.from('profiles').delete().eq('id', user.id);

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
