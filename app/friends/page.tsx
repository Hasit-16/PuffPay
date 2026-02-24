"use client";

import { useEffect, useState, useMemo } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Check, X, Users, Search, Star, SortAsc } from "lucide-react";
import Link from "next/link";
import { getFriendRequests, getMyFriends, acceptFriendRequest, ignoreFriendRequest, getSentRequests, toggleFavoriteStatus } from "./actions";
import { getMyGroups } from "@/app/groups/list_actions";
import { toast } from "sonner";
import { Group } from "@/types";

// Types
type Request = { id: string; sender: { id: string; username: string | null; avatar_url: string | null }; created_at: string };
type SentRequest = { id: string; recipient: { id: string; username: string | null; avatar_url: string | null }; created_at: string };
type Friend = {
    id: string;
    username: string | null;
    avatar_url: string | null;
    friendship_id: string;
    is_favorite: boolean;
    created_at: string;
};

export default function FriendsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter/Sort State
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "newest">("name-asc");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [reqs, sent, frnds, grps] = await Promise.all([
            getFriendRequests(),
            getSentRequests(),
            getMyFriends(),
            getMyGroups()
        ]);
        setRequests(reqs as any);
        setSentRequests(sent as any);
        setFriends(frnds as any);
        setGroups(grps as any);
        setLoading(false);
    };

    const handleAccept = async (id: string) => {
        await acceptFriendRequest(id);
        loadData(); // Reload to refresh lists
    };

    const handleIgnore = async (id: string) => {
        await ignoreFriendRequest(id);
        loadData();
    };

    const handleToggleFavorite = async (friend: Friend) => {
        // Optimistic update
        setFriends(prev => prev.map(f =>
            f.id === friend.id ? { ...f, is_favorite: !f.is_favorite } : f
        ));

        const result = await toggleFavoriteStatus(friend.friendship_id, friend.is_favorite);
        if (result?.error) {
            toast.error("Failed to update favorite status");
            // Revert on error
            setFriends(prev => prev.map(f =>
                f.id === friend.id ? { ...f, is_favorite: friend.is_favorite } : f
            ));
        }
    };

    // Filter & Sort Logic
    const processedFriends = useMemo(() => {
        let filtered = friends.filter(friend =>
            friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filtered.sort((a, b) => {
            // Apply selected sort
            // Note: Favorites are visually marked but do NOT enforce top sorting anymore per user request.

            if (sortBy === "name-asc") {
                return (a.username || "").localeCompare(b.username || "");
            } else if (sortBy === "name-desc") {
                return (b.username || "").localeCompare(a.username || "");
            } else if (sortBy === "newest") {
                // Sort by created_at descending (newest first)
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return 0;
        });
    }, [friends, searchQuery, sortBy]);

    return (
        <div className="min-h-screen bg-transparent pb-20">
            <TopBar />

            <main className="px-4 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Social</h1>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hidden sm:flex" asChild>
                            <Link href="/groups">
                                <Users className="w-4 h-4 mr-2" />
                                Add Group
                            </Link>
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" asChild>
                            <Link href="/friends/add">
                                <UserPlus className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Add Friend</span>
                                <span className="sm:hidden">Add</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Mobile-only Add Group Button */}
                <div className="sm:hidden w-full mb-4">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                        <Link href="/groups">
                            <Users className="w-4 h-4 mr-2" />
                            Create New Group
                        </Link>
                    </Button>
                </div>

                <Tabs defaultValue="friends" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1">
                        <TabsTrigger value="friends" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-zinc-50 data-[state=active]:shadow-sm text-zinc-400 transition-all">My Friends</TabsTrigger>
                        <TabsTrigger value="groups" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-zinc-50 data-[state=active]:shadow-sm text-zinc-400 transition-all">My Groups</TabsTrigger>
                        <TabsTrigger value="requests" className="relative rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-zinc-50 data-[state=active]:shadow-sm text-zinc-400 transition-all">
                            Requests
                            {requests.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-zinc-50">
                                    {requests.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends" className="space-y-4">
                        {/* Search & Sort Controls */}
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="Search friends..."
                                    className="pl-9 bg-white/5 backdrop-blur-md border border-white/10 text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-white/20 rounded-2xl"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                                <SelectTrigger className="w-[140px] bg-white/5 backdrop-blur-md border border-white/10 text-zinc-300 hover:bg-white/10 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <SortAsc className="h-4 w-4 text-zinc-400" />
                                        <SelectValue placeholder="Sort by" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 backdrop-blur-xl border border-white/10 text-zinc-50">
                                    <SelectItem value="name-asc" className="focus:bg-white/10 focus:text-white">Name (A-Z)</SelectItem>
                                    <SelectItem value="name-desc" className="focus:bg-white/10 focus:text-white">Name (Z-A)</SelectItem>
                                    <SelectItem value="newest" className="focus:bg-white/10 focus:text-white">Newest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3 flex items-center justify-between animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                                            <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                                        </div>
                                        <div className="h-5 w-16 bg-white/10 rounded-md"></div>
                                    </div>
                                ))}
                            </div>
                        ) : processedFriends.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-full inline-block mb-4">
                                    <UserPlus className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium mb-2 text-zinc-50">{searchQuery ? "No matching friends" : "No friends yet"}</h3>
                                <p className="text-zinc-500 mb-6">{searchQuery ? "Try a different search term" : "Add friends to start sharing expenses."}</p>
                                {!searchQuery && (
                                    <Link href="/friends/add">
                                        <Button className="bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-zinc-50 rounded-full">Find Friends</Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            processedFriends.map(friend => (
                                <div key={friend.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-3 transition-all hover:bg-white/10">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={friend.avatar_url || ""} />
                                            <AvatarFallback>{friend.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-zinc-50">{friend.username}</p>
                                                <button
                                                    onClick={() => handleToggleFavorite(friend)}
                                                    className="focus:outline-none"
                                                >
                                                    <Star
                                                        className={`w-4 h-4 ${friend.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-slate-300 hover:text-slate-400"}`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/settle/${friend.id}`}>View</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="groups" className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3 flex items-center justify-between animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                                            <div className="flex flex-col gap-2">
                                                <div className="h-5 w-32 bg-white/10 rounded-md"></div>
                                                <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                                            </div>
                                        </div>
                                        <div className="h-8 w-8 bg-white/10 rounded-md"></div>
                                    </div>
                                ))}
                            </div>
                        ) : groups.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-full inline-block mb-4">
                                    <Users className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium mb-2 text-zinc-50">No groups yet</h3>
                                <p className="text-zinc-500 mb-6">Create a group to split expenses with multiple people.</p>
                                <Link href="/groups">
                                    <Button className="bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-zinc-50 rounded-full">Create Group</Button>
                                </Link>
                            </div>
                        ) : (
                            groups.map(group => (
                                <Link key={group.id} href={`/groups/${group.id}`} className="block">
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-3 transition-all hover:bg-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-zinc-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-zinc-50">{group.name}</p>
                                                <p className="text-xs text-zinc-500">Group</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-300">
                                                <span className="sr-only">View</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-4 h-4"><path d="m9 18 6-6-6-6" /></svg>
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="requests" className="space-y-6">
                        {/* Incoming Requests */}
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-500 mb-3 px-1 uppercase tracking-wider">Incoming</h3>
                            {loading ? (
                                <div className="space-y-4 mt-2">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-3 flex items-center justify-between animate-pulse">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="h-5 w-24 bg-white/10 rounded-md"></div>
                                                    <div className="h-4 w-32 bg-white/10 rounded-md"></div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-8 w-16 bg-white/10 rounded-md"></div>
                                                <div className="h-8 w-16 bg-white/10 rounded-md"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : requests.length === 0 ? (
                                <p className="text-sm text-zinc-500 italic px-1">No pending requests.</p>
                            ) : (
                                requests.map(req => (
                                    <div key={req.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-3 transition-all hover:bg-white/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={req.sender.avatar_url || ""} />
                                                    <AvatarFallback>{req.sender.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-zinc-50 text-sm">{req.sender.username}</p>
                                                    <p className="text-xs text-zinc-500">Sent you a request</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" className="h-8 px-3 bg-white/5 border border-white/10 text-zinc-400 hover:text-zinc-50 hover:bg-white/10 rounded-lg" onClick={() => handleIgnore(req.id)}>
                                                    <X className="h-4 w-4 mr-1" />
                                                    Decline
                                                </Button>
                                                <Button size="sm" className="h-8 px-3 bg-green-500 text-zinc-950 font-semibold hover:bg-green-400 rounded-lg" onClick={() => handleAccept(req.id)}>
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Accept
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Sent Requests */}
                        {sentRequests.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-zinc-500 mb-3 px-1 mt-6 uppercase tracking-wider">Sent</h3>
                                {sentRequests.map(req => (
                                    <div key={req.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 mb-3 transition-all hover:bg-white/10 opacity-80">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={req.recipient.avatar_url || ""} />
                                                    <AvatarFallback>{req.recipient.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-zinc-50 text-sm">{req.recipient.username}</p>
                                                    <p className="text-xs text-zinc-500">Waiting for approval</p>
                                                </div>
                                            </div>
                                            <Button size="sm" className="bg-white/5 border border-white/10 text-zinc-500 text-xs h-8" disabled>
                                                Pending
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            <BottomNav />
        </div>
    );
}
