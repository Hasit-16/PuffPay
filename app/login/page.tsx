
"use client";

import { useState, Suspense } from "react";
import { login, signup } from "./actions";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"login" | "signup">("login");
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        // Determine which action to call based on mode
        // We can't directly pass the server action to the form action if we want to toggle
        // So we wrap it.
        if (mode === "login") {
            await login(formData);
        } else {
            await signup(formData);
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">

            {/* Header */}
            <div className="p-6 text-center border-b border-white/10 flex flex-col items-center">
                <div className="flex items-center justify-center mb-6">
                    <img
                        src="/logo-transparent.png"
                        alt="PuffPay Logo"
                        className="h-16 w-auto object-contain drop-shadow-md"
                    />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Login to PuffPay</h2>
                <p className="text-slate-400 text-sm">
                    {mode === "login"
                        ? "Welcome back! Login to your account."
                        : "Create an account to start tracking."}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setMode("login")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "login"
                        ? "bg-white/10 text-white border-b-2 border-green-500"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    Login
                </button>
                <button
                    onClick={() => setMode("signup")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "signup"
                        ? "bg-white/10 text-white border-b-2 border-green-500"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    Sign Up
                </button>
            </div>

            {/* Form Body */}
            <div className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <User size={16} /> Username
                            </label>
                            <input
                                name="username"
                                required
                                placeholder="johndoe"
                                className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-2xl text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Mail size={16} /> Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="john@example.com"
                            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-2xl text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Lock size={16} /> Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-2xl text-zinc-50 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} /> Processing...
                            </>
                        ) : mode === "login" ? (
                            "Sign In"
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
