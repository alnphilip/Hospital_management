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
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Context/Subtitle */}
            <div>
                <p className="text-muted text-[15px] font-medium tracking-wide">
                    Here&apos;s an overview of your health activity.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card label="Total Appointments" value={stats.total} icon={CalendarDays} color="#0ea5e9" />
                <Card label="Upcoming" value={stats.upcoming} icon={Clock} color="#14b8a6" />
                <Card label="Completed" value={stats.completed} icon={Activity} color="#22c55e" />
                <Card label="Prescriptions" value={stats.prescriptions} icon={FileText} color="#8b5cf6" />
            </div>

            <div className="glass rounded-[2rem] border border-glass p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        Upcoming Appointments
                    </h2>
                </div>
                {upcomingAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl border border-dashed border-glass">
                        <CalendarDays size={48} className="text-muted opacity-50 mb-4" />
                        <p className="text-base text-muted font-medium">
                            No upcoming appointments. Book your first appointment!
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {upcomingAppointments.map((apt) => (
                        <div
                                key={apt.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between p-6 rounded-[2rem] glass-panel border border-white/10 transition-all hover:scale-[1.01] hover:shadow-2xl"
                            >
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <p className="text-base font-semibold text-foreground">
                                            {apt.reason || "General Consultation"}
                                        </p>
                                        <StatusBadge status={apt.status} />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-muted font-medium mt-1">
                                        <Clock size={15} className="text-primary opacity-80" />
                                        <span>
                                            {apt.appointment_date}
                                            {apt.status !== "pending" && apt.appointment_time && apt.appointment_time !== "00:00:00" ? (
                                                <> at {apt.appointment_time}</>
                                            ) : (
                                                <span className="ml-1 text-amber-500 dark:text-amber-400">— Awaiting time slot</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Right Side Context */}
                                {apt.doctors?.profiles?.full_name && (
                                    <div className="flex items-center gap-2 shrink-0 sm:self-end">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-foreground">Dr. {apt.doctors.profiles.full_name}</span>
                                            <span className="text-xs uppercase tracking-wider text-muted font-semibold">{apt.doctors.specialization}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500 ml-2">
                                            <Activity size={14} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
