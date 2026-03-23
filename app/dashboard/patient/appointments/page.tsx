"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    notes: string;
    doctors?: { id: string; user_id: string; specialization: string; profiles?: { full_name: string } };
    departments?: { id: string; name: string };
    [key: string]: unknown;
}

interface Department {
    id: string;
    name: string;
}

interface Doctor {
    id: string;
    user_id: string;
    specialization: string;
    consultation_time: string;
    department_id: string | null;
    is_available: boolean;
    profiles?: { full_name: string };
}

export default function PatientAppointments() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [patientId, setPatientId] = useState<string | null>(null);

    const [form, setForm] = useState({
        department_id: "",
        doctor_id: "",
        appointment_date: "",
        reason: "",
    });

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/patient/appointments");
            const result = await res.json();

            if (result.patientId) {
                setPatientId(result.patientId);
                setAppointments(result.appointments || []);
                setDepartments(result.departments || []);
                setDoctors(result.doctors || []);
            } else {
                // Patient record doesn't exist yet — auto-create via register API
                const { createClient } = await import("@/lib/supabaseClient");
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const createRes = await fetch("/api/register-patient", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: user.id }),
                    });
                    const createResult = await createRes.json();
                    if (createResult.patientId) {
                        setPatientId(createResult.patientId);
                    }
                }
            }
        } catch {
            console.error("Failed to load appointments");
        }
        setLoading(false);
    }

    // Filter doctors by selected department
    const filteredDoctors = form.department_id
        ? doctors.filter((d) => d.department_id === form.department_id)
        : doctors;

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!patientId) {
            toast.error("Patient profile not found. Please contact support.");
            return;
        }
        setSubmitting(true);

        try {
            const res = await fetch("/api/patient/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    patientId,
                    department_id: form.department_id || null,
                    doctor_id: form.doctor_id || null,
                    appointment_date: form.appointment_date,
                    appointment_time: "00:00",
                    reason: form.reason,
                }),
            });

            const result = await res.json();
            if (!res.ok) {
                toast.error(result.error || "Failed to book appointment.");
            } else {
                toast.success("Appointment booked!");
                setShowModal(false);
                setForm({ department_id: "", doctor_id: "", appointment_date: "", reason: "" });
                loadData();
            }
        } catch {
            toast.error("Failed to book appointment.");
        }
        setSubmitting(false);
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 rounded-xl hover:from-sky-600 hover:to-teal-600 shadow-lg shadow-sky-500/25 transition-all"
                >
                    <Plus size={16} />
                    Book Appointment
                </button>
            </div>

            {/* Appointments List */}
            {appointments.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 text-sm">No appointments yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((apt) => (
                        <div
                            key={apt.id}
                            className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {apt.reason || "General Consultation"}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    📅 {apt.appointment_date}
                                    {apt.status !== "pending" && apt.appointment_time && apt.appointment_time !== "00:00:00" ? (
                                        <> &nbsp;⏰ {apt.appointment_time}</>
                                    ) : (
                                        <span className="ml-2 text-amber-500 dark:text-amber-400">⏳ Awaiting time slot</span>
                                    )}
                                </p>
                                {apt.doctors?.profiles?.full_name && (
                                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                                        🩺 Dr. {apt.doctors.profiles.full_name} ({apt.doctors.specialization})
                                    </p>
                                )}
                                {apt.departments?.name && (
                                    <p className="text-xs text-slate-400 mt-0.5">🏥 {apt.departments.name}</p>
                                )}
                                {apt.notes && (
                                    <p className="text-xs text-slate-400 mt-1 truncate">
                                        Notes: {apt.notes}
                                    </p>
                                )}
                            </div>
                            <StatusBadge status={apt.status} />
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Book Appointment">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                        <select
                            value={form.department_id}
                            onChange={(e) => setForm({ ...form, department_id: e.target.value, doctor_id: "" })}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        >
                            <option value="">Select department</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Preferred Doctor with consultation time */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Preferred Doctor <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <select
                            value={form.doctor_id}
                            onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        >
                            <option value="">Any available doctor</option>
                            {filteredDoctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    Dr. {d.profiles?.full_name || "Unknown"} — {d.specialization || "General"}
                                    {d.consultation_time ? ` (🕐 ${d.consultation_time})` : ""}
                                </option>
                            ))}
                        </select>
                        {form.doctor_id && (() => {
                            const doc = doctors.find((d) => d.id === form.doctor_id);
                            return doc?.consultation_time ? (
                                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1.5 flex items-center gap-1">
                                    🕐 Consultation hours: {doc.consultation_time}
                                </p>
                            ) : null;
                        })()}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
                        <input
                            type="date"
                            value={form.appointment_date}
                            onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        />
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">⏰ Time will be assigned by the office based on doctor availability.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                        <textarea
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder="Describe your reason for visit..."
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Booking...</> : "Book Appointment"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
