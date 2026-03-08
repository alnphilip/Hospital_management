"use client";

import { useEffect, useState } from "react";
import { Users, Stethoscope, CalendarDays, Clock, Building2 } from "lucide-react";
import Card from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabaseClient";

export default function AdminOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        patients: 0,
        doctors: 0,
        departments: 0,
        appointments: 0,
        pending: 0,
    });

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const supabase = createClient();

            const [pRes, dRes, depRes, aRes] = await Promise.all([
                supabase.from("patients").select("*", { count: "exact", head: true }),
                supabase.from("doctors").select("*", { count: "exact", head: true }),
                supabase.from("departments").select("*", { count: "exact", head: true }),
                supabase.from("appointments").select("status"),
            ]);

            const appointments = aRes.data || [];

            setStats({
                patients: pRes.count || 0,
                doctors: dRes.count || 0,
                departments: depRes.count || 0,
                appointments: appointments.length,
                pending: appointments.filter((a) => a.status === "pending").length,
            });
        } catch { }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Analytics</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Analytics ⚡</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">System-wide overview of all operations.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card label="Total Patients" value={stats.patients} icon={Users} color="#0ea5e9" />
                <Card label="Doctors" value={stats.doctors} icon={Stethoscope} color="#14b8a6" />
                <Card label="Departments" value={stats.departments} icon={Building2} color="#8b5cf6" />
                <Card label="Appointments" value={stats.appointments} icon={CalendarDays} color="#ef4444" />
                <Card label="Pending Approval" value={stats.pending} icon={Clock} color="#f59e0b" />
            </div>
        </div>
    );
}
