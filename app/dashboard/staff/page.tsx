"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, CheckCircle, Users, Stethoscope, Building2 } from "lucide-react";
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
    doctors?: { id: string; user_id: string; specialization: string; profiles?: { full_name: string } };
    departments?: { id: string; name: string };
}

export default function StaffOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, assigned: 0, completed: 0, doctorCount: 0 });
    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/staff/appointments");
            const result = await res.json();
            if (res.ok) {
                const all: Appointment[] = result.appointments || [];
                const docs = result.doctors || [];
                setStats({
                    total: all.length,
                    pending: all.filter((a) => a.status === "pending").length,
                    verified: all.filter((a) => a.status === "verified").length,
                    assigned: all.filter((a) => a.status === "assigned").length,
                    completed: all.filter((a) => a.status === "completed").length,
                    doctorCount: docs.length,
                });
                // Show most recent non-completed appointments
                const active = all.filter((a) => a.status !== "completed" && a.status !== "cancelled");
                setRecentAppointments(active.slice(0, 8));
            }
        } catch { }
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff Dashboard 📋</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Unified overview — manage all appointments across departments.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card label="Total" value={stats.total} icon={CalendarDays} color="#8b5cf6" />
                <Card label="Pending" value={stats.pending} icon={Clock} color="#f59e0b" />
                <Card label="Verified" value={stats.verified} icon={CheckCircle} color="#0ea5e9" />
                <Card label="Assigned" value={stats.assigned} icon={Users} color="#14b8a6" />
                <Card label="Completed" value={stats.completed} icon={CheckCircle} color="#22c55e" />
                <Card label="Doctors" value={stats.doctorCount} icon={Stethoscope} color="#ec4899" />
            </div>

            {/* Active Appointments */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Active Appointments (All Departments)
                </h2>
                {recentAppointments.length === 0 ? (
                    <p className="text-sm text-slate-400 py-8 text-center">No active appointments.</p>
                ) : (
                    <div className="space-y-3">
                        {recentAppointments.map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{apt.reason || "Consultation"}</p>
                                    <div className="flex flex-wrap gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        <span>📅 {apt.appointment_date} {apt.appointment_time && apt.appointment_time !== "00:00:00" ? `⏰ ${apt.appointment_time}` : "⏳ No time set"}</span>
                                        {apt.patients?.profiles?.full_name && (
                                            <span>👤 {apt.patients.profiles.full_name}</span>
                                        )}
                                        {apt.doctors?.profiles?.full_name && (
                                            <span className="text-teal-600 dark:text-teal-400">🩺 Dr. {apt.doctors.profiles.full_name}</span>
                                        )}
                                        {apt.departments?.name && (
                                            <span>🏥 {apt.departments.name}</span>
                                        )}
                                    </div>
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
