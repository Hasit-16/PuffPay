
import { createClient } from '@/lib/supabase/client';
import { Profile, Friendship } from '@/types';

// Browser-side helper for now, can be adapted for server-side
const supabase = createClient();

export async function getUserProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data as Profile;
}

export async function getFriends(userId: string): Promise<Friendship[]> {
    const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

    if (error) {
        console.error('Error fetching friends:', error);
        return [];
    }

    return data as Friendship[];
}

export async function getBalance(userId: string): Promise<number> {
    // Placeholder: In future, this will sum up (owed_to_me - i_owe)
    // For now, returning 0 as requested
    return 0;
}
