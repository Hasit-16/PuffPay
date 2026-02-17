"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyGroups() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // Fetch groups where user is a member
    const { data: groupMembers, error } = await supabase
        .from("group_members")
        .select("group_id, groups ( id, name, created_by )")
        .eq("user_id", user.id);

    if (error) {
        console.error("Error fetching groups:", error);
        return [];
    }

    // Transform data
    // groupMembers is array of { group_id, groups: { id, name, ... } }
    // We want array of Group objects
    // The type of groups in join might be array or single object depending on relationship. 
    // Since group_id references groups.id, it's one-to-one from member perspective (each member row points to one group).

    // However, Supabase typings can be tricky.
    // Let's assume groups is a single object here securely.

    return groupMembers.map((m: any) => m.groups).filter(Boolean);
}

export async function getGroupMembers(groupId: string) {
    const supabase = await createClient();

    const { data: members, error } = await supabase
        .from("group_members")
        .select("user_id, profiles ( id, username, avatar_url )")
        .eq("group_id", groupId);

    if (error) {
        console.error("Error fetching group members:", error);
        return [];
    }

    // Flatten to array of profiles
    return members.map((m: any) => m.profiles).filter(Boolean);
}
