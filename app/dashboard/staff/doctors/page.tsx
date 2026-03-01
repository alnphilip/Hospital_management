"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { TableSkeleton } from "@/components/ui/Skeleton";

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
        const supabase = createClient();
        const { data } = await supabase.from("doctors").select("*, profiles(full_name), departments(name)").order("is_available", { ascending: false });
        setDoctors(data || []);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Doctors</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Doctor Directory</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                    <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {doc.profiles?.full_name || "Unknown"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {doc.specialization || "General"}
                                </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${doc.is_available ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"}`}>
                                {doc.is_available ? "Available" : "Busy"}
                            </span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            <p>🏥 {doc.departments?.name || "No department"}</p>
                            <p>🎓 {doc.qualification || "N/A"}</p>
                            <p>📅 {doc.experience_years} years experience</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
