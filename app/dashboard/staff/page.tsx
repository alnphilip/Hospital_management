"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, CheckCircle, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabaseClient";

export default function StaffOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, assigned: 0 });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const supabase = createClient();
            const { data: appointments } = await supabase.from("appointments").select("status");
            const all = appointments || [];
            setStats({
                total: all.length,
                pending: all.filter((a) => a.status === "pending").length,
                verified: all.filter((a) => a.status === "verified").length,
                assigned: all.filter((a) => a.status === "assigned").length,
            });
        } catch { }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Dashboard 📋</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and monitor appointment workflows.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card label="Total Appointments" value={stats.total} icon={CalendarDays} color="#8b5cf6" />
                <Card label="Pending Review" value={stats.pending} icon={Clock} color="#f59e0b" />
                <Card label="Verified" value={stats.verified} icon={CheckCircle} color="#0ea5e9" />
                <Card label="Assigned" value={stats.assigned} icon={Users} color="#14b8a6" />
            </div>
        </div>
    );
}
