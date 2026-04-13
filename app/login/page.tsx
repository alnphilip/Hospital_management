"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Mail, Lock, Loader2, User } from "lucide-react";
import { signIn, getUserRole, getRolePath } from "@/lib/auth";
import { Component as InfiniteGrid } from "@/components/ui/the-infinite-grid";
import toast from "react-hot-toast";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [recentEmails, setRecentEmails] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("hospital_recent_emails");
        if (saved) {
            try {
                setRecentEmails(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse recent emails", e);
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        // Save email to recent list
        const updated = [email, ...recentEmails.filter(e => e !== email)].slice(0, 3);
        localStorage.setItem("hospital_recent_emails", JSON.stringify(updated));

        const role = await getUserRole();
        if (role) {
            toast.success("Welcome back!");
            router.push(getRolePath(role));
        } else {
            toast.error("Unable to determine your role.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden px-4">
            {/* Background Shader */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-100">
                <InfiniteGrid />
            </div>
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] md:w-[40%] h-[40%] bg-sky-300/40 dark:bg-sky-600/30 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] md:w-[30%] h-[30%] bg-teal-300/40 dark:bg-teal-600/30 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-12 animate-fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                        <Activity className="text-white" size={24} strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-foreground">
                        SmartHospital
                    </span>
                </div>

                {/* Card */}
                <div className="glass-panel rounded-[2rem] p-8 md:p-10 shadow-2xl animate-fade-in">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-muted font-semibold mt-2">
                            Access your medical portal
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground/80 ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <Mail
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
                                />
                                <input
                                    type="email"
                                    list="recent-emails"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@hospital.com"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                                <datalist id="recent-emails">
                                    {recentEmails.map((e) => (
                                        <option key={e} value={e} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-bold text-foreground/80">
                                    Password
                                </label>
                                <Link href="#" className="text-xs font-bold text-primary hover:underline">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock
                                    size={18}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:scale-[1.02] shadow-xl shadow-sky-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In to Dashboard"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm font-bold text-muted mt-10">
                    New to the system?{" "}
                    <Link
                        href="/register"
                        className="text-primary hover:underline ml-1"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
}
