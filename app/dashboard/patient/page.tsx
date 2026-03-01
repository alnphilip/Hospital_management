"use client";

import { useEffect, useState } from "react";
import { CalendarDays, FileText, Clock, Activity } from "lucide-react";
import Card from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabaseClient";
import StatusBadge from "@/components/ui/StatusBadge";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    [key: string]: unknown;
}

export default function PatientOverview() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAppointments: 0,
        upcoming: 0,
        prescriptions: 0,
        pending: 0,
    });
    const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get patient record
            const { data: patient } = await supabase
                .from("patients")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (patient) {
                // Get appointments
                const { data: appointments } = await supabase
                    .from("appointments")
                    .select("*")
                    .eq("patient_id", patient.id)
                    .order("appointment_date", { ascending: false })
                    .limit(5);

                const allAppointments = appointments || [];
                const upcoming = allAppointments.filter(
                    (a) => new Date(a.appointment_date) >= new Date() && a.status !== "cancelled"
                );
                const pending = allAppointments.filter((a) => a.status === "pending");

                // Get prescriptions count
                const { count: rxCount } = await supabase
                    .from("prescriptions")
                    .select("*", { count: "exact", head: true })
                    .eq("patient_id", patient.id);

                setStats({
                    totalAppointments: allAppointments.length,
                    upcoming: upcoming.length,
                    prescriptions: rxCount || 0,
                    pending: pending.length,
                });

                setRecentAppointments(allAppointments.slice(0, 5));
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

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card label="Total Appointments" value={stats.totalAppointments} icon={CalendarDays} color="#0ea5e9" />
                <Card label="Upcoming" value={stats.upcoming} icon={Clock} color="#14b8a6" />
                <Card label="Prescriptions" value={stats.prescriptions} icon={FileText} color="#8b5cf6" />
                <Card label="Pending" value={stats.pending} icon={Activity} color="#f59e0b" />
            </div>

            {/* Recent Appointments */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Recent Appointments
                </h2>
                {recentAppointments.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 py-8 text-center">
                        No appointments yet. Book your first appointment!
                    </p>
                ) : (
                    <div className="space-y-3">
                        {recentAppointments.map((apt) => (
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
