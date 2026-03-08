"use client";

import { useEffect, useState } from "react";
import { CalendarDays, FileText, Clock, Activity } from "lucide-react";
import Card from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    doctors?: { id: string; user_id: string; specialization: string; profiles?: { full_name: string } };
    departments?: { name: string };
    [key: string]: unknown;
}

export default function PatientOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        completed: 0,
        prescriptions: 0,
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/patient/data?type=overview");
            const result = await res.json();
            if (res.ok) {
                setStats(result.stats);
                setUpcomingAppointments(result.upcomingAppointments || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                    Welcome back! 👋
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Here&apos;s an overview of your health activity.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card label="Total Appointments" value={stats.total} icon={CalendarDays} color="#0ea5e9" />
                <Card label="Upcoming" value={stats.upcoming} icon={Clock} color="#14b8a6" />
                <Card label="Completed" value={stats.completed} icon={Activity} color="#22c55e" />
                <Card label="Prescriptions" value={stats.prescriptions} icon={FileText} color="#8b5cf6" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Upcoming Appointments
                </h2>
                {upcomingAppointments.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">
                        No upcoming appointments. Book your first appointment!
                    </p>
                ) : (
                    <div className="space-y-3">
                        {upcomingAppointments.map((apt) => (
                            <div
                                key={apt.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                            >
                                <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {apt.reason || "General Consultation"}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {apt.appointment_date} at {apt.appointment_time}
                                    </p>
                                    {apt.doctors?.profiles?.full_name && (
                                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                                            🩺 Dr. {apt.doctors.profiles.full_name} ({apt.doctors.specialization})
                                        </p>
                                    )}
                                    {apt.departments?.name && (
                                        <p className="text-xs text-slate-400 mt-0.5">🏥 {apt.departments.name}</p>
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
