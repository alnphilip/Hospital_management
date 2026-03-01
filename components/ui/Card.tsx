import { type LucideIcon } from "lucide-react";

interface CardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    trend?: string;
}

export default function Card({ label, value, icon: Icon, color = "#3b82f6", trend }: CardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                    {trend && (
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{trend}</p>
                    )}
                </div>
                <div
                    className="flex items-center justify-center w-11 h-11 rounded-xl"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Icon size={22} style={{ color }} />
                </div>
            </div>

            {/* Decorative gradient */}
            <div
                className="absolute bottom-0 left-0 h-1 w-full opacity-60"
                style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
            />
        </div>
    );
}
