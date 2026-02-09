"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateAvatar(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const file = formData.get("file") as File;
    if (!file) {
        return { error: "No file provided" };
    }

    // validate file type/size if needed (simplified for now)
    if (file.size > 2 * 1024 * 1024) {
        return { error: "File size must be less than 2MB" };
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        return { error: "Failed to upload image" };
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

    // Update Profile
    // Force a cache bust query param to ensure UI updates immediately
    const publicUrlWithTimestamp = `${publicUrl}?t=${new Date().getTime()}`;

    const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrlWithTimestamp })
        .eq("id", user.id);

    if (updateError) {
        console.error("Profile update error:", updateError);
        return { error: "Failed to update profile" };
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
