
"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Check, X } from "lucide-react";
import Link from "next/link";
import { getFriendRequests, getMyFriends, acceptFriendRequest, ignoreFriendRequest } from "./actions";

// Types
type Request = { id: string; sender: { id: string; username: string | null; avatar_url: string | null }; created_at: string };
type Friend = { id: string; username: string | null; avatar_url: string | null };

export default function FriendsPage() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [reqs, frnds] = await Promise.all([getFriendRequests(), getMyFriends()]);
        setRequests(reqs as any);
        setFriends(frnds as any);
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
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Friends</h1>
                    <Link href="/friends/add">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Friend
                        </Button>
                    </Link>
                </div>

                <Tabs defaultValue="friends" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="friends">My Friends</TabsTrigger>
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
                                            <p className="font-semibold">{friend.username}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/settle/${friend.id}`}>View</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="requests" className="space-y-4">
                        {loading ? (
                            <p className="text-center text-slate-500 mt-8">Loading requests...</p>
                        ) : requests.length === 0 ? (
                            <p className="text-center text-slate-500 py-12">No pending requests.</p>
                        ) : (
                            requests.map(req => (
                                <Card key={req.id} className="border-slate-200 dark:border-slate-800">
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
                    </TabsContent>
                </Tabs>
            </main>

            <BottomNav />
        </div>
    );
}
