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
        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900" size="lg" disabled={pending}>
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
                    <Button variant="ghost" size="icon" className="-ml-2">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </Button>
                </Link>
                <h1 className="text-xl font-semibold ml-2 text-slate-900 dark:text-white">New Group</h1>
            </div>

            <form action={clientAction} className="space-y-8 max-w-md mx-auto">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-500">Group Name</label>
                    <Input
                        name="name"
                        placeholder="e.g. Goa Trip, Flatmates"
                        required
                        className="border-slate-200 dark:border-slate-800"
                    />
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-500">Add Members</label>
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 w-full animate-pulse rounded-xl" />
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
                                        className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                            ? "border-indigo-500 dark:border-indigo-400"
                                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                            }`}
                                    >
                                        <Avatar className="h-10 w-10 mr-3 border border-slate-200 dark:border-slate-700">
                                            <AvatarImage src={friend.avatar_url || ""} />
                                            <AvatarFallback>{friend.username?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className={`font-medium ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-slate-900 dark:text-white"}`}>
                                                {friend.username}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="h-6 w-6 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4" />
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
