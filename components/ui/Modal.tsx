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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/40 backdrop-blur-[10px] pointer-events-auto"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={`relative z-[1001] w-full ${sizeClasses[size]} pointer-events-auto mx-auto bg-white/95 dark:bg-[#0b1224]/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
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
