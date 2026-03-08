"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Users, FileText, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    patients?: { id: string; user_id: string; profiles?: { full_name: string } };
    [key: string]: unknown;
}

export default function DoctorOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, today: 0, prescriptions: 0, pending: 0 });
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/doctor/data?type=overview");
            const result = await res.json();
            if (res.ok) {
                setStats(result.stats);
                setTodayAppointments(result.todayAppointments || []);
            }
        } catch {}
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Good day, Doctor! 🩺
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Here&apos;s your schedule overview.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card label="Total Assigned" value={stats.total} icon={CalendarDays} color="#14b8a6" />
                <Card label="Today" value={stats.today} icon={Clock} color="#0ea5e9" />
                <Card label="Prescriptions Written" value={stats.prescriptions} icon={FileText} color="#8b5cf6" />
                <Card label="Pending Review" value={stats.pending} icon={Users} color="#f59e0b" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Today&apos;s Appointments
                </h2>
                {todayAppointments.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center">No appointments today.</p>
                ) : (
                    <div className="space-y-3">
                        {todayAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{apt.reason || "Consultation"}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">⏰ {apt.appointment_time}</p>
                                    {apt.patients?.profiles?.full_name && (
                                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">👤 {apt.patients.profiles.full_name}</p>
                                    )}
                                </div>
                                <StatusBadge status={apt.status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
