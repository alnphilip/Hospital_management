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
    onClose?: () => void;
}

export default function Sidebar({ links, role, roleColor, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <aside
            className={`${collapsed ? "lg:w-[80px]" : "lg:w-72"
                } w-full h-full flex flex-col glass rounded-[2rem] shadow-2xl transition-all duration-400 ease-spring z-30 overflow-hidden border border-glass`}
        >
            {/* Logo / Brand - Glass Header effect */}
            <div className="flex items-center justify-between gap-4 px-6 h-20 border-b border-glass bg-surface/20 shrink-0">
                <div className="flex items-center gap-4 overflow-hidden">
                    <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg`}
                        style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)` }}
                    >
                        {role.charAt(0).toUpperCase()}
                    </div>
                    {(!collapsed || isMobile) && (
                        <div className="overflow-hidden">
                            <p className="text-base font-black text-foreground tracking-tight truncate">
                                Smart Hospital
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: roleColor }}>
                                {role} Portal
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Mobile Close Button */}
                <button 
                    onClick={onClose}
                    className="lg:hidden p-2 hover:bg-surface/50 rounded-xl text-muted"
                >
                    <ChevronLeft size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {links.map((link) => {
                    const isActive =
                        pathname === link.href ||
                        (link.href !== `/dashboard/${role}` && pathname.startsWith(link.href));
                    const Icon = link.icon;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => {
                                if (isMobile && onClose) onClose();
                            }}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group relative overflow-hidden ${isActive
                                ? "text-white shadow-xl shadow-sky-500/10"
                                : "text-muted hover:bg-surface/50 hover:text-foreground"
                                }`}
                        >
                            {/* Active Indicator Background */}
                            {isActive && (
                                <div 
                                    className="absolute inset-0 z-0 transition-opacity"
                                    style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}aa)` }} 
                                />
                            )}
                            
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`shrink-0 z-10 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"
                                    }`}
                            />
                            {(!collapsed || isMobile) && (
                                <span className="truncate z-10 text-[15px] tracking-tight">{link.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle (Desktop Only) */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex items-center justify-center h-16 border-t border-glass bg-surface/30 hover:bg-surface/60 text-muted transition-colors shrink-0"
            >
                {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
        </aside>
    );
}
