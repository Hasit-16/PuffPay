"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Camera, LogOut, Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
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
import { updateProfile, deactivateAccount, getProfile } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [user, setUser] = useState<{ id: string; username: string | null; avatar_url: string | null; email?: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isSupported, subscription, subscribeToPush, unsubscribeFromPush, isLoading: isPushLoading } = usePushNotifications();

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("Unauthorized");

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setAvatarUrl(publicUrl);
            toast.success("Image uploaded! Don't forget to save changes.");
        } catch (error: any) {
            toast.error("Error uploading avatar: " + error.message);
        } finally {
            setUploading(false);
        }
    };
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
        setIsDeactivating(true);
        const result = await deactivateAccount();

        if (result?.error) {
            toast.error("Failed to deactivate: " + result.error);
            setIsDeactivating(false);
        } else {
            // Aggressively clear local cache
            router.refresh();

            // Sign out to clear session
            const supabase = createClient();
            await supabase.auth.signOut();

            // Hard redirect
            router.push("/login");
            toast.success("Account permanently deleted");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-xl font-bold mb-2">Profile Not Found</h1>
                <Button onClick={() => router.push("/login")}>Go to Login</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20">
            <TopBar />

            <main className="px-4 py-8 max-w-md mx-auto">
                <div className="flex flex-col items-center mb-8">
                    <Avatar className="w-24 h-24 mb-4 shadow-lg">
                        <AvatarImage src={avatarUrl || user.avatar_url || ""} />
                        <AvatarFallback className="text-2xl">{username?.charAt(0)?.toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl font-bold text-zinc-50">{user.username || "User"}</h1>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit Profile</h2>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        {/* Avatar Selection */}
                        <div className="w-full max-w-md mb-8">
                            <div className="flex justify-center mb-6">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg relative">
                                        {avatarUrl ? (
                                            <Image
                                                src={avatarUrl}
                                                alt="Avatar"
                                                fill
                                                className="object-cover"
                                                priority
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <User className="w-12 h-12" />
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Tabs defaultValue="defaults" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/5 border border-white/10 p-1 rounded-xl">
                                    <TabsTrigger value="defaults" className="text-zinc-500 data-[state=active]:bg-white/10 data-[state=active]:text-zinc-50 rounded-lg">Illustrations</TabsTrigger>
                                    <TabsTrigger value="upload" className="text-zinc-500 data-[state=active]:bg-white/10 data-[state=active]:text-zinc-50 rounded-lg">Upload</TabsTrigger>
                                </TabsList>

                                <TabsContent value="defaults" className="space-y-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            "Felix", "Aneka", "Zoe", "Jack",
                                            "Leo", "Molly", "Sam", "Bear"
                                        ].map((seed) => (
                                            <button
                                                key={seed}
                                                type="button"
                                                onClick={() => setAvatarUrl(`https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`)}
                                                className={`relative aspect-square rounded-full overflow-hidden transition-all ${avatarUrl?.includes(seed)
                                                    ? "ring-2 ring-green-500 ring-offset-2 ring-offset-[#09090B]"
                                                    : "border border-white/10 hover:border-white/20"
                                                    }`}
                                            >
                                                <Image
                                                    src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}`}
                                                    alt={seed}
                                                    fill
                                                    className="object-cover p-1"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-center text-zinc-600">
                                        Powered by <a href="https://dicebear.com" target="_blank" rel="noreferrer" className="underline hover:text-zinc-400">DiceBear</a>
                                    </p>
                                </TabsContent>

                                <TabsContent value="upload" className="space-y-4">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-4 transition-colors cursor-pointer hover:bg-white/10" onClick={() => fileInputRef.current?.click()}>
                                        <div className="p-3 rounded-full bg-white/10">
                                            <Camera className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium">Click to upload image</p>
                                            <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        {/* Avatar URL is managed by above UI now */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Username</label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                minLength={3}
                                required
                                className="bg-black/20 border-white/10 rounded-2xl focus-visible:ring-1 focus-visible:ring-white/20"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-green-500 text-zinc-950 font-semibold hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all rounded-2xl" disabled={saving}>
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </form>
                </div>

                {isSupported && (
                    <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-blue-400" />
                                    Push Notifications
                                </h2>
                                <p className="text-sm text-zinc-400 mt-1 max-w-[220px]">
                                    Get alerts for new expenses and nudges on this device.
                                </p>
                            </div>
                            <Button
                                variant={subscription ? "outline" : "default"}
                                className={subscription ? "border-red-500/50 text-red-400 hover:bg-red-500/10" : "bg-blue-600 hover:bg-blue-500 text-white"}
                                onClick={() => {
                                    if (subscription) {
                                        unsubscribeFromPush();
                                    } else if (user) {
                                        subscribeToPush(user.id);
                                    }
                                }}
                                disabled={isPushLoading}
                            >
                                {isPushLoading ? "Working..." : subscription ? "Disable" : "Enable"}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="mt-8 border-t border-white/10 pt-6">
                    <Button variant="outline" className="w-full" onClick={async () => {
                        const supabase = createClient();
                        await supabase.auth.signOut();
                        router.push("/login");
                        toast.success("Signed out");
                    }}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                        <p className="text-sm text-red-400 mb-4">
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
                                    <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeactivate} disabled={isDeactivating} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
                                        {isDeactivating ? "Deleting..." : "Yes, delete my account"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </main>

        </div>
    );
}
