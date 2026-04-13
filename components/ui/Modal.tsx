"use client";

import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const sizeClasses = {
        sm: "max-w-[440px]",
        md: "max-w-[560px]",
        lg: "max-w-[720px]",
    };

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center pointer-events-none p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/60 dark:bg-black/60 backdrop-blur-md pointer-events-auto"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={`relative z-[1001] w-full ${sizeClasses[size]} pointer-events-auto mx-auto bg-surface/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100/50 dark:border-slate-800/50">
                    <h3 className="text-lg font-bold text-foreground tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-10 h-10 rounded-xl text-muted hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-8 py-8 max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>
            </div>
        </div>,
        document.body
    );
}
