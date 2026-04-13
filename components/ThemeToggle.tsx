"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="w-11 h-11 rounded-2xl glass-panel animate-pulse opacity-50" />;
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center w-11 h-11 rounded-2xl glass-panel text-muted hover:text-foreground hover:bg-surface/60 transition-all duration-300 border border-transparent hover:border-glass overflow-hidden group relative"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                <Sun 
                    size={20} 
                    className="absolute inset-0 transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-amber-500" 
                />
                <Moon 
                    size={20} 
                    className="absolute inset-0 transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-sky-400" 
                />
            </div>
            
            {/* Subtle highlight effect */}
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </button>
    );
}
