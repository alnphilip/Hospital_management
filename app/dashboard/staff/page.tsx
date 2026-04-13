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
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Context/Subtitle */}
            <div>
                <p className="text-muted text-[15px] font-medium tracking-wide">Unified overview — manage all appointments across departments.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <Card label="Total" value={stats.total} icon={CalendarDays} color="#8b5cf6" />
                <Card label="Pending" value={stats.pending} icon={Clock} color="#f59e0b" />
                <Card label="Verified" value={stats.verified} icon={CheckCircle} color="#0ea5e9" />
                <Card label="Assigned" value={stats.assigned} icon={Users} color="#14b8a6" />
                <Card label="Completed" value={stats.completed} icon={CheckCircle} color="#22c55e" />
                <Card label="Doctors" value={stats.doctorCount} icon={Stethoscope} color="#ec4899" />
            </div>

            {/* Active Appointments */}
            <div className="glass rounded-[2rem] border border-glass p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                        Active Appointments (All Departments)
                    </h2>
                </div>
                
                {recentAppointments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl border border-dashed border-glass">
                        <CalendarDays size={48} className="text-muted opacity-50 mb-4" />
                        <p className="text-base text-muted font-medium">No active appointments found.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {recentAppointments.map((apt) => (
                            <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between p-5 rounded-2xl bg-white dark:bg-[#0f172a] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800/80 transition-all hover:scale-[1.01] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]">
                                {/* Left: Subject & Status */}
                                <div className="flex flex-col gap-1.5 flex-w">
                                    <div className="flex items-center gap-3">
                                        <p className="text-base font-semibold text-foreground">
                                            {apt.reason || "General Consultation"}
                                        </p>
                                        <StatusBadge status={apt.status} />
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted font-medium mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={15} className="text-primary opacity-80" />
                                            <span>
                                                {apt.appointment_date} 
                                                {apt.appointment_time && apt.appointment_time !== "00:00:00" ? ` at ${apt.appointment_time}` : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: People involved */}
                                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                    {apt.patients?.profiles?.full_name && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-foreground">{apt.patients.profiles.full_name}</span>
                                            <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                <Users size={12} />
                                            </div>
                                        </div>
                                    )}
                                    {apt.doctors?.profiles?.full_name && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-muted">Dr. {apt.doctors.profiles.full_name}</span>
                                            <div className="w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                                                <Stethoscope size={12} />
                                            </div>
                                        </div>
                                    )}
                                    {apt.departments?.name && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-muted tracking-wider uppercase">{apt.departments.name}</span>
                                            <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                                                <Building2 size={12} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
