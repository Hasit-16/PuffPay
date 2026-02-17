"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const membersJson = formData.get("members") as string;

    if (!name || !name.trim()) {
        return { error: "Group name is required" };
    }

    let memberIds: string[] = [];
    try {
        memberIds = JSON.parse(membersJson);
    } catch (e) {
        return { error: "Invalid members data" };
    }

    if (memberIds.length === 0) {
        return { error: "Select at least one member" };
    }

    // 1. Create Group
    const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
            name,
            created_by: user.id
        })
        .select()
        .single();

    if (groupError) {
        console.error("Error creating group:", groupError);
        return { error: `Failed to create group: ${groupError.message || JSON.stringify(groupError)}` };
    }

    // 2. Add Members (including self if needed? Usually groups include creator implicitly or explicitly. 
    // Requirement says "select friends". 
    // Let's add the creator implicitly as well to group_members?
    // "You" are usually part of the group you create in Splitwise.
    // Let's add creator + selected friends.

    const allMembers = [user.id, ...memberIds];
    // Remove duplicates just in case
    const uniqueMembers = Array.from(new Set(allMembers));

    const membersData = uniqueMembers.map(userId => ({
        group_id: group.id,
        user_id: userId
    }));

    const { error: membersError } = await supabase
        .from("group_members")
        .insert(membersData);

    if (membersError) {
        console.error("Error adding members:", membersError);
        // Should probably delete the group if members fail, but for now just return error
        return { error: "Failed to add members" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/groups");

    return { success: true };
}
