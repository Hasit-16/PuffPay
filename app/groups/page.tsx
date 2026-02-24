"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMyFriends } from "@/app/friends/actions";
import { createGroup } from "./actions";

// Types
type Friend = { id: string; username: string | null; avatar_url: string | null };

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg" disabled={pending}>
            {pending ? "Creating..." : "Create Group"}
            {!pending && <Plus className="ml-2 w-4 h-4" />}
        </Button>
    );
}

export default function CreateGroupPage() {
    const router = useRouter();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);

    useEffect(() => {
        getMyFriends().then((data) => {
            setFriends(data as any);
            setLoading(false);
        });
    }, []);

    const toggleFriend = (id: string) => {
        if (selectedFriendIds.includes(id)) {
            setSelectedFriendIds(selectedFriendIds.filter(fid => fid !== id));
        } else {
            setSelectedFriendIds([...selectedFriendIds, id]);
        }
    };

    const clientAction = async (formData: FormData) => {
        if (selectedFriendIds.length === 0) {
            toast.error("Please select at least one friend");
            return;
        }

        // Append selected friends to FormData because standard form submission won't include them easily if they aren't inputs
        // But we can just use a hidden input or pass it differently.
        // Let's us bind the server action or just append to formData before calling.
        // Actually, better to just use a hidden input for each or JSON stringify.
        formData.append("members", JSON.stringify(selectedFriendIds));

        const result = await createGroup(formData);
        if (result?.error) {
            toast.error(result.error);
        } else if (result?.success) {
            toast.success("Group created successfully");
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen px-4 py-6">
            <div className="flex items-center mb-8">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="-ml-2 hover:bg-white/10">
                        <ArrowLeft className="w-6 h-6 text-zinc-50" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold ml-2 text-zinc-50">New Group</h1>
            </div>

            <form action={clientAction} className="space-y-8 max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-400">Group Name</label>
                    <Input
                        name="name"
                        placeholder="e.g. Goa Trip, Flatmates"
                        required
                        className="bg-black/20 border border-white/10 rounded-2xl text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/20"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-400">Add Members</label>
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 w-full animate-pulse bg-white/5 rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {friends.map(friend => {
                                const isSelected = selectedFriendIds.includes(friend.id);
                                return (
                                    <div
                                        key={friend.id}
                                        onClick={() => toggleFriend(friend.id)}
                                        className={`flex items-center p-3 rounded-2xl border cursor-pointer transition-all ${isSelected
                                            ? "bg-indigo-500/20 border-indigo-500/50"
                                            : "bg-black/20 border border-white/10 hover:border-white/20 hover:bg-white/5"
                                            }`}
                                    >
                                        <Avatar className="h-10 w-10 mr-3">
                                            <AvatarImage src={friend.avatar_url || ""} />
                                            <AvatarFallback>{friend.username?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className={`font-medium ${isSelected ? "text-indigo-400" : "text-zinc-50"}`}>
                                                {friend.username}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="h-6 w-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {friends.length === 0 && !loading && (
                        <p className="text-sm text-slate-500 text-center py-4">You need to add friends first!</p>
                    )}
                </div>

                <div className="pt-4">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}
