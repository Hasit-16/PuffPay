
"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
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
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-800">

            {/* Header */}
            <div className="p-6 text-center border-b border-slate-800 bg-slate-900 flex flex-col items-center">
                <Image src="/logo-transparent.png" width={180} height={60} alt="PuffPay Logo" className="object-contain mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-white mb-2">Login to PuffPay</h1>
                <p className="text-slate-400 text-sm">
                    {mode === "login"
                        ? "Welcome back! Login to your account."
                        : "Create an account to start tracking."}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
                <button
                    onClick={() => setMode("login")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "login"
                        ? "bg-slate-800 text-white border-b-2 border-green-500"
                        : "text-slate-400 hover:text-white"
                        }`}
                >
                    Login
                </button>
                <button
                    onClick={() => setMode("signup")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "signup"
                        ? "bg-slate-800 text-white border-b-2 border-green-500"
                        : "text-slate-400 hover:text-white"
                        }`}
                >
                    Sign Up
                </button>
            </div>

            {/* Form Body */}
            <div className="p-6 bg-slate-900">
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
                                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <Suspense fallback={<div className="text-white">Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
