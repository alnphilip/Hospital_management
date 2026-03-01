"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { TableSkeleton } from "@/components/ui/Skeleton";

interface Profile {
    id: string;
    full_name: string;
    role: string;
    phone: string;
    created_at: string;
    [key: string]: unknown;
}

export default function AdminStaff() {
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<Profile[]>([]);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        const supabase = createClient();
        const { data } = await supabase.from("profiles").select("*").eq("role", "staff").order("created_at", { ascending: false });
        setStaff(data || []);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Office Staff</h1>

            {staff.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 text-sm">No staff members found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staff.map((s) => (
                        <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                                    {s.full_name?.charAt(0)?.toUpperCase() || "S"}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.full_name || "Unknown"}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{s.role}</p>
                                </div>
                            </div>
                            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                                <p>📞 {s.phone || "N/A"}</p>
                                <p>📅 Joined: {new Date(s.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
