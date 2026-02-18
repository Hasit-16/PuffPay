
"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, X, Users } from "lucide-react";
import Link from "next/link";
import { getFriendRequests, getMyFriends, acceptFriendRequest, ignoreFriendRequest, getSentRequests } from "./actions";
import { getMyGroups } from "@/app/groups/list_actions";

// Types
type Request = { id: string; sender: { id: string; username: string | null; avatar_url: string | null }; created_at: string };
type SentRequest = { id: string; recipient: { id: string; username: string | null; avatar_url: string | null }; created_at: string };
type Friend = { id: string; username: string | null; avatar_url: string | null };

import { Group } from "@/types";

export default function FriendsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
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

                {/* Mobile-only Add Group Button (since hidden above on mobile to save space) */}
                <div className="sm:hidden w-full mb-4">
                    <Button size="sm" variant="outline" className="w-full" asChild>
                        <Link href="/groups">
                            <Users className="w-4 h-4 mr-2" />
                            Create New Group
                        </Link>
                    </Button>
                </div>

                <Tabs defaultValue="friends" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="friends">My Friends</TabsTrigger>
                        <TabsTrigger value="groups">My Groups</TabsTrigger>
                        <TabsTrigger value="requests" className="relative">
                            Requests
                            {requests.length > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                    {requests.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends" className="space-y-4">
                        {loading ? (
                            <p className="text-center text-slate-500 mt-8">Loading friends...</p>
                        ) : friends.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full inline-block mb-4">
                                    <UserPlus className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No friends yet</h3>
                                <p className="text-slate-500 mb-6">Add friends to start sharing expenses.</p>
                                <Link href="/friends/add">
                                    <Button variant="outline">Find Friends</Button>
                                </Link>
                            </div>
                        ) : (
                            friends.map(friend => (
                                <Card key={friend.id} className="border-slate-200 dark:border-slate-800">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={friend.avatar_url || ""} />
                                            <AvatarFallback>{friend.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900 dark:text-white">{friend.username}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/settle/${friend.id}`}>View</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="groups" className="space-y-4">
                        {loading ? (
                            <p className="text-center text-slate-500 mt-8">Loading groups...</p>
                        ) : groups.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full inline-block mb-4">
                                    <Users className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No groups yet</h3>
                                <p className="text-slate-500 mb-6">Create a group to split expenses with multiple people.</p>
                                <Link href="/groups">
                                    <Button variant="outline">Create Group</Button>
                                </Link>
                            </div>
                        ) : (
                            groups.map(group => (
                                <Link key={group.id} href={`/groups/${group.id}`} className="block">
                                    <Card className="border-slate-200 dark:border-slate-800 hover:border-green-500 dark:hover:border-green-500 transition-colors">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-900 dark:text-white">{group.name}</p>
                                                <p className="text-xs text-slate-500">Group</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-slate-400">
                                                <span className="sr-only">View</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right w-4 h-4"><path d="m9 18 6-6-6-6" /></svg>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="requests" className="space-y-6">
                        {/* Incoming Requests */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 mb-3 px-1">INCOMING</h3>
                            {loading ? (
                                <p className="text-center text-slate-500 mt-2">Loading...</p>
                            ) : requests.length === 0 ? (
                                <p className="text-sm text-slate-400 italic px-1">No pending requests.</p>
                            ) : (
                                requests.map(req => (
                                    <Card key={req.id} className="border-slate-200 dark:border-slate-800 mb-3">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={req.sender.avatar_url || ""} />
                                                    <AvatarFallback>{req.sender.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm">{req.sender.username}</p>
                                                    <p className="text-xs text-slate-500">Sent you a request</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleIgnore(req.id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAccept(req.id)}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Sent Requests */}
                        {sentRequests.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 mb-3 px-1 mt-6">SENT</h3>
                                {sentRequests.map(req => (
                                    <Card key={req.id} className="border-slate-200 dark:border-slate-800 mb-3 opacity-80">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={req.recipient.avatar_url || ""} />
                                                    <AvatarFallback>{req.recipient.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm">{req.recipient.username}</p>
                                                    <p className="text-xs text-slate-500">Waiting for approval</p>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" disabled className="text-xs h-8">
                                                Pending
                                            </Button>
                                        </CardContent>
                                    </Card>
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
