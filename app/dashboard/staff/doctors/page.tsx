"use client";

import { useEffect, useState } from "react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Building2, GraduationCap, CalendarClock, UserCheck, UserX } from "lucide-react";

interface Doctor {
    id: string;
    specialization: string;
    qualification: string;
    experience_years: number;
    is_available: boolean;
    profiles?: { full_name: string };
    departments?: { name: string };
    [key: string]: unknown;
}

export default function StaffDoctors() {
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/staff/appointments");
            const result = await res.json();
            if (res.ok) {
                setDoctors(result.doctors || []);
            }
        } catch {
            console.error("Failed to load doctors");
        }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-foreground">Doctors</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Doctor Directory</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                    <div 
                        key={doc.id} 
                        className="group flex flex-col p-6 rounded-[2rem] bg-white dark:bg-[#0f172a] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]"
                    >
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex flex-col gap-0.5">
                                <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                                    Dr. {doc.profiles?.full_name || "Unknown"}
                                </h3>
                                <div className="text-xs font-semibold text-muted tracking-wide uppercase opacity-70">
                                    {doc.specialization || "General Medicine"}
                                </div>
                            </div>
                            
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                doc.is_available 
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}>
                                {doc.is_available ? (
                                    <><UserCheck size={12} /> Available</>
                                ) : (
                                    <><UserX size={12} /> Busy</>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 overflow-hidden">
                                    <Building2 size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter opacity-50">Department</span>
                                    <span className="text-xs font-semibold text-foreground truncate">{doc.departments?.name || "General Care"}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 overflow-hidden">
                                    <GraduationCap size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter opacity-50">Qualification</span>
                                    <span className="text-xs font-semibold text-foreground truncate">{doc.qualification || "MBBS"}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 overflow-hidden">
                                    <CalendarClock size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter opacity-50">Experience</span>
                                    <span className="text-xs font-semibold text-foreground">{doc.experience_years} Years Tenure</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
