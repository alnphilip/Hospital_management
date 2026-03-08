"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ShieldCheck, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    doctor_id: string | null;
    patients?: {
        id: string;
        user_id: string;
        profiles?: { full_name: string };
    };
    doctors?: {
        id: string;
        user_id: string;
        specialization: string;
        profiles?: { full_name: string };
    };
    departments?: { id: string; name: string };
    [key: string]: unknown;
}

interface Doctor {
    id: string;
    user_id: string;
    specialization: string;
    is_available: boolean;
    is_active: boolean;
    department_id: string | null;
    profiles?: { full_name: string };
    departments?: { name: string };
    [key: string]: unknown;
}

export default function StaffAppointments() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [assignDoctor, setAssignDoctor] = useState<Record<string, string>>({});

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/staff/appointments");
            const result = await res.json();
            if (res.ok) {
                setAppointments(result.appointments || []);
                setDoctors(result.doctors || []);
            } else {
                toast.error(result.error || "Failed to load appointments");
            }
        } catch {
            toast.error("Failed to load appointments");
        }
        setLoading(false);
    }

    async function verifyAppointment(id: string) {
        try {
            const res = await fetch("/api/staff/appointments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appointmentId: id, action: "verify" }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Appointment verified!");
                loadData();
            } else {
                toast.error(result.error || "Failed to verify");
            }
        } catch {
            toast.error("Failed to verify appointment");
        }
    }

    async function assignAppointment(id: string) {
        const docId = assignDoctor[id];
        if (!docId) { toast.error("Select a doctor first."); return; }
        try {
            const res = await fetch("/api/staff/appointments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appointmentId: id, action: "assign", doctorId: docId }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Doctor assigned!");
                loadData();
            } else {
                toast.error(result.error || "Failed to assign");
            }
        } catch {
            toast.error("Failed to assign doctor");
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Appointments</h1>

            {appointments.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 text-sm">No appointments found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{apt.reason || "General Consultation"}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">📅 {apt.appointment_date} &nbsp;⏰ {apt.appointment_time}</p>
                                    {apt.patients?.profiles?.full_name && (
                                        <p className="text-xs text-slate-400 mt-0.5">👤 Patient: {apt.patients.profiles.full_name}</p>
                                    )}
                                    {apt.departments?.name && (
                                        <p className="text-xs text-slate-400 mt-0.5">🏥 {apt.departments.name}</p>
                                    )}
                                    {apt.doctors?.profiles?.full_name && (
                                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">🩺 Dr. {apt.doctors.profiles.full_name} ({apt.doctors.specialization})</p>
                                    )}
                                </div>
                                <StatusBadge status={apt.status} />
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {apt.status === "pending" && (
                                    <button onClick={() => verifyAppointment(apt.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition">
                                        <ShieldCheck size={14} /> Verify
                                    </button>
                                )}
                                {apt.status === "verified" && (
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={assignDoctor[apt.id] || ""}
                                            onChange={(e) => setAssignDoctor({ ...assignDoctor, [apt.id]: e.target.value })}
                                            className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                                        >
                                            <option value="">Select Doctor</option>
                                            {doctors
                                                .filter((d) => d.department_id === apt.departments?.id)
                                                .map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.profiles?.full_name || "Unknown"} — {d.specialization || "General"} {d.is_available ? "" : "[Busy]"}
                                                </option>
                                            ))}
                                        </select>
                                        <button onClick={() => assignAppointment(apt.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400 rounded-lg hover:bg-purple-100 transition">
                                            <UserPlus size={14} /> Assign
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
