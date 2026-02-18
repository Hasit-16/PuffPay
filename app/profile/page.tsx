"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getProfile, updateProfile, deactivateAccount } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<{ id: string; username: string | null; avatar_url: string | null; email?: string } | null>(null);

    // Form State
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        getProfile().then((data) => {
            if (data) {
                setUser(data as any);
                setUsername(data.username || "");
                setAvatarUrl(data.avatar_url || "");
            }
            setLoading(false);
        });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const formData = new FormData();
        formData.append("username", username);
        formData.append("avatar_url", avatarUrl);

        const result = await updateProfile(formData);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Profile updated successfully");
            router.refresh();
        }
        setSaving(false);
    };

    const handleDeactivate = async () => {
        const result = await deactivateAccount();
        if (result?.error) {
            toast.error("Failed to deactivate: " + result.error);
        } else {
            // Sign out
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/login");
            toast.success("Account deactivated");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <p className="text-slate-500">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                <h1 className="text-xl font-bold mb-2">Profile Not Found</h1>
                <Button onClick={() => router.push("/login")}>Go to Login</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <TopBar />

            <main className="px-4 py-8 max-w-md mx-auto">
                <div className="flex flex-col items-center mb-8">
                    <Avatar className="w-24 h-24 mb-4 border-4 border-white dark:border-slate-800 shadow-lg">
                        <AvatarImage src={avatarUrl || user.avatar_url || ""} />
                        <AvatarFallback className="text-2xl">{username?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.username || "User"}</h1>
                    <p className="text-slate-500">{user.email}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Profile</h2>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username</label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                minLength={3}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Avatar URL</label>
                            <Input
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                            />
                            <p className="text-xs text-slate-500">Paste a direct link to an image.</p>
                        </div>

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                    <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4">
                        <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                            Deactivating your account will permanently remove your profile and access to groups. This action cannot be undone.
                        </p>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">Deactivate Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeactivate} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                                        Yes, delete my account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
