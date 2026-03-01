"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { useState } from "react";

export interface SidebarLink {
    href: string;
    label: string;
    icon: LucideIcon;
}

interface SidebarProps {
    links: SidebarLink[];
    role: string;
    roleColor: string;
}

export default function Sidebar({ links, role, roleColor }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`${collapsed ? "w-[72px]" : "w-64"
                } h-screen sticky top-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-30`}
        >
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 px-4 h-16 border-b border-slate-200 dark:border-slate-800">
                <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0`}
                    style={{ background: roleColor }}
                >
                    {role.charAt(0).toUpperCase()}
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            Smart Hospital
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                            {role} Portal
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const isActive =
                        pathname === link.href ||
                        (link.href !== `/dashboard/${role}` && pathname.startsWith(link.href));
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                    ? "text-white shadow-lg"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            style={isActive ? { background: roleColor } : undefined}
                        >
                            <Icon
                                size={20}
                                className={`shrink-0 ${isActive ? "" : "group-hover:scale-110 transition-transform"
                                    }`}
                            />
                            {!collapsed && <span className="truncate">{link.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center justify-center h-12 border-t border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
        </aside>
    );
}
