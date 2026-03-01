"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import StatusBadge from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    notes: string;
    [key: string]: unknown;
}

export default function DoctorAppointments() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctorId, setDoctorId] = useState<string | null>(null);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: doctor } = await supabase.from("doctors").select("id").eq("user_id", user.id).single();
        if (doctor) {
            setDoctorId(doctor.id);
            const { data } = await supabase
                .from("appointments")
                .select("*")
                .eq("doctor_id", doctor.id)
                .order("appointment_date", { ascending: false });
            setAppointments(data || []);
        }
        setLoading(false);
    }

    async function markComplete(id: string) {
        const supabase = createClient();
        const { error } = await supabase.from("appointments").update({ status: "completed" }).eq("id", id);
        if (error) toast.error(error.message);
        else { toast.success("Marked as completed!"); loadData(); }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Appointments</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assigned Appointments</h1>

            {appointments.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 text-sm">No assigned appointments.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{apt.reason || "Consultation"}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">📅 {apt.appointment_date} &nbsp;⏰ {apt.appointment_time}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={apt.status} />
                                {apt.status === "assigned" && (
                                    <button onClick={() => markComplete(apt.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition">
                                        <CheckCircle size={14} /> Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
