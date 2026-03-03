"use client";

import { useState, useRef, useEffect } from "react";
import { Search, UserPlus, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { searchUsers, sendFriendRequest, UserResult } from "@/app/friends/actions";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { toast } from "sonner";

export default function AddFriendPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleSearch = async (term: string) => {
        if (term.length < 3) {
            setResults([]);
            setLoading(false); // Ensure loading is false if term is too short
            return;
        }

        setLoading(true);
        try {
            const users = await searchUsers(term);
            setResults(users);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            handleSearch(val);
        }, 500);
    };

    const executeSearch = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        handleSearch(query);
    }

    const handleAddFriend = async (userId: string) => {
        setPendingRequests((prev) => new Set(prev).add(userId));
        const res = await sendFriendRequest(userId);
        if (res.error) {
            // Revert optimistic update
            const next = new Set(pendingRequests);
            next.delete(userId);
            setPendingRequests(next);
            toast.error(res.error);
        } else {
            // Update the result status to 'pending' manually to reflect change
            setResults(prev => prev.map(u => u.id === userId ? { ...u, friendship_status: 'pending' } : u));
        }
    };

    return (
        <div className="min-h-screen pb-20">
            <TopBar />

            <main className="px-4 py-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-50 mb-2">Find Friends</h1>
                    <p className="text-zinc-400 mb-6">Search for users by username or email.</p>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                            <Input
                                placeholder="Search username..."
                                className="pl-9 bg-black/20 border border-white/10 rounded-2xl text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-white/20"
                                value={query}
                                onChange={onInputChange}
                                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                            />
                        </div>
                        <Button onClick={executeSearch} disabled={loading} className="bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 rounded-2xl">
                            {loading ? '...' : 'Search'}
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {results.length === 0 && query.length >= 3 && !loading && (
                        <p className="text-center text-zinc-500 py-8">No users found.</p>
                    )}

                    {results.map((user) => (
                        <div key={user.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.avatar_url || ""} />
                                        <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-zinc-50">{user.username}</p>
                                    </div>
                                </div>

                                {user.friendship_status === 'none' && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleAddFriend(user.id)}
                                        disabled={pendingRequests.has(user.id)}
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add
                                    </Button>
                                )}

                                {user.friendship_status === 'pending' && (
                                    <Button size="sm" className="bg-white/5 text-zinc-500 border border-white/10" disabled>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Pending
                                    </Button>
                                )}

                                {user.friendship_status === 'sent' && (
                                    <Button size="sm" className="bg-white/5 text-zinc-500 border border-white/10" disabled>
                                        <Check className="w-4 h-4 mr-2" />
                                        Sent
                                    </Button>
                                )}

                                {user.friendship_status === 'accepted' && (
                                    <Button size="sm" className="bg-transparent text-green-500 cursor-default hover:bg-transparent" disabled>
                                        <Check className="w-4 h-4 mr-2" />
                                        Friends
                                    </Button>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
