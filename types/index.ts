
export interface Profile {
    id: string; // uuid
    username: string | null;
    email: string | null;
    avatar_url: string | null;
    trust_score: number;
    created_at: string;
}

export interface Friendship {
    id: string; // uuid
    user_id: string; // uuid
    friend_id: string; // uuid
    status: 'accepted' | 'pending';
    created_at: string;
}

export interface Transaction {
    id: string; // uuid
    payer_id: string | null; // uuid
    borrower_id: string | null; // uuid
    amount: number;
    description: string | null;
    status: 'pending' | 'paid' | 'confirmed' | 'rejected';
    created_at: string;
}
