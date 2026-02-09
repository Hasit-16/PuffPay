"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { updateAvatar, signOut } from "./actions";
import { Button } from "@/components/ui/button";
import { Camera, LogOut, User } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadProfile = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);
                const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
                setProfile(data);
            }
            setLoading(false);
        };
        loadProfile();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        const result = await updateAvatar(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Profile photo updated");
            // Refresh profile data locally to show new image immediately (optimistic-ish)
            // Ideally trigger a re-fetch or rely on revalidatePath + router.refresh() 
            // but effectively we might need to reload the window to force image cache clear 
            // if strict caching is on, though we added timestamp in action.
            window.location.reload();
        }
        setUploading(false);
    };

    const handleSignOut = async () => {
        await signOut();
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            <div className="px-4 py-8 flex flex-col items-center">
                <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-8">My Profile</h1>

                {/* Avatar */}
                <div className="relative mb-6 group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg relative bg-slate-200">
                        {profile?.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt="Avatar"
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                                <User className="w-12 h-12" />
                            </div>
                        )}

                        {/* Overlay Loader */}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-slate-900 text-white p-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
                        disabled={uploading}
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Basic Info */}
                <div className="w-full max-w-sm space-y-4 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Username</p>
                        <p className="font-medium text-slate-900 dark:text-white text-lg">{profile?.username || "No username"}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                        <p className="font-medium text-slate-900 dark:text-white text-lg">{user?.email}</p>
                    </div>
                </div>

                {/* Actions */}
                <form action={handleSignOut} className="w-full max-w-sm">
                    <Button variant="destructive" size="lg" className="w-full">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </form>

                <p className="text-xs text-slate-400 mt-8">v0.1.0 • PuffPay Beta</p>
            </div>

            <BottomNav />
        </div>
    );
}
