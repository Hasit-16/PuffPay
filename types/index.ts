
export interface Profile {
    id: string; // uuid
    username: string | null;
    email: string | null;
    avatar_url: string | null;
    trust_score: number;
    puff_score: number; // Added for global score calculation
    created_at: string;
}

export interface Friendship {
    id: string; // uuid
    user_id: string; // uuid
    friend_id: string; // uuid
    status: 'accepted' | 'pending';
    is_favorite?: boolean;
    created_at: string;
}

export interface Transaction {
    id: string; // uuid
    payer_id: string | null; // uuid
    borrower_id: string | null; // uuid
    amount: number;
    description: string | null;
    status: 'pending' | 'paid' | 'confirming' | 'settled' | 'rejected';
    created_at: string;
}

export interface Group {
    id: string; // uuid
    name: string;
    created_by: string; // uuid
    created_at: string;
}

export interface GroupMember {
    group_id: string; // uuid
    user_id: string; // uuid
    joined_at: string;
}
