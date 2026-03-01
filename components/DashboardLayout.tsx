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
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
            <Sidebar links={links} role={role} roleColor={roleColor} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                        {role} Dashboard
                    </h2>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                            <User size={16} className="text-slate-500 dark:text-slate-400" />
                            <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                                {userName || role}
                            </span>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 dark:hover:text-red-400 transition-all duration-200"
                            aria-label="Sign out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
