import { type LucideIcon } from "lucide-react";

interface CardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    trend?: string;
}

export default function Card({ label, value, icon: Icon, color = "var(--color-primary)", trend }: CardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl glass p-5 transition-all duration-200 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-2">
                    <p className="text-sm uppercase tracking-wider text-muted font-medium">{label}</p>
                    <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
                    {trend && (
                        <p className="text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full inline-block">
                            {trend}
                        </p>
                    )}
                </div>
                <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl backdrop-blur-md border border-white/20 dark:border-white/5"
                    style={{ backgroundColor: `${color}15`, color: color }}
                >
                    <Icon size={24} strokeWidth={2} />
                </div>
            </div>

            {/* Decorative high-tech gradient */}
            <div
                className="absolute bottom-0 right-0 w-32 h-32 opacity-20 blur-2xl rounded-full"
                style={{ background: color, transform: 'translate(30%, 30%)' }}
            />
            <div
                className="absolute top-0 left-0 w-full h-[1px] opacity-40"
                style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
            />
        </div>
    );
}
