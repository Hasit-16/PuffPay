"use server";

import { createClient } from "@/lib/supabase/server";
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

    // Deleting profile row.
    // Assuming DB has ON DELETE CASCADE for relationships to avoid foreign key errors,
    // otherwise this will fail if user has friendships/transactions.
    const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

    if (error) {
        console.error("Deactivate error:", error);
        return { error: error.message };
    }

    return { success: true };
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
