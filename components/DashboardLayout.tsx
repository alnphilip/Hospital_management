"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Menu, X } from "lucide-react";
import Sidebar, { type SidebarLink } from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { signOut } from "@/lib/auth";
import { useState } from "react";

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <div className="flex h-screen bg-background p-3 md:p-6 gap-4 md:gap-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
            
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                w-[280px] lg:w-auto p-4 lg:p-0 h-full
            `}>
                <Sidebar links={links} role={role} roleColor={roleColor} onClose={() => setIsMobileMenuOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0 gap-4 md:gap-6 z-10 relative h-full">
                {/* Top Header */}
                <header className="flex items-center justify-between px-4 md:px-6 h-16 md:h-20 glass rounded-[1.5rem] md:rounded-3xl shrink-0">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 hover:bg-surface/50 rounded-xl text-muted"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-lg md:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted capitalize tracking-tight">
                            {role} Portal
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle />

                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-surface/50 border border-glass shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {userName ? userName.charAt(0).toUpperCase() : role.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-foreground max-w-[120px] truncate">
                                {userName || role}
                            </span>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="flex items-center justify-center w-10 md:w-11 h-10 md:h-11 rounded-xl md:rounded-2xl text-muted hover:bg-red-500/10 hover:text-red-500 border border-transparent transition-all duration-300"
                            aria-label="Sign out"
                        >
                            <LogOut size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </header>

                {/* Main Content Pane */}
                <main className="flex-1 p-4 md:p-8 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl overflow-y-auto relative custom-scrollbar border border-white/10">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
