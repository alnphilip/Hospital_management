"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import Sidebar, { type SidebarLink } from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { signOut } from "@/lib/auth";

interface DashboardLayoutProps {
    children: React.ReactNode;
    links: SidebarLink[];
    role: string;
    roleColor: string;
    userName?: string;
}

export default function DashboardLayout({
    children,
    links,
    role,
    roleColor,
    userName,
}: DashboardLayoutProps) {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-[#040914] p-4 sm:p-6 gap-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
            
            <Sidebar links={links} role={role} roleColor={roleColor} />

            <div className="flex-1 flex flex-col min-w-0 gap-6 z-10 relative h-full">
                {/* Top Header - Immovable */}
                <header className="flex items-center justify-between px-6 h-20 glass rounded-3xl shrink-0">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted capitalize tracking-tight">
                        {role} Dashboard
                    </h2>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />

                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-surface/50 border border-glass shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {userName ? userName.charAt(0).toUpperCase() : role.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-foreground max-w-[150px] truncate">
                                {userName || role}
                            </span>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="flex items-center justify-center w-11 h-11 rounded-2xl text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-300"
                            aria-label="Sign out"
                        >
                            <LogOut size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </header>

                {/* Main Content Pane - Scrollable Canvas */}
                <main className="flex-1 p-6 bg-white dark:bg-[#0b1224]/80 backdrop-blur-sm rounded-[2rem] shadow-xl overflow-y-auto relative custom-scrollbar border border-slate-200/50 dark:border-slate-800/40">
                    {children}
                </main>
            </div>
        </div>
    );
}
