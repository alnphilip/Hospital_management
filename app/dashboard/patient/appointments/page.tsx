"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Clock, Activity, Building2 } from "lucide-react";
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
                <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
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
                <div className="text-center py-16 glass rounded-2xl border border-glass">
                    <p className="text-muted text-sm">No appointments yet.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {appointments.map((apt) => (
                        <div
                            key={apt.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between p-5 rounded-2xl bg-white dark:bg-[#0f172a] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800/80 transition-all hover:scale-[1.01] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]"
                        >
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center gap-3">
                                    <p className="text-base font-semibold text-foreground">
                                        {apt.reason || "General Consultation"}
                                    </p>
                                    <StatusBadge status={apt.status} />
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted font-medium mt-1">
                                    <div className="flex items-center gap-1.5 text-primary opacity-80 mt-1">
                                        <Clock size={15} />
                                        <span>
                                            {apt.appointment_date}
                                            {apt.status !== "pending" && apt.appointment_time && apt.appointment_time !== "00:00:00" ? (
                                                <> at {apt.appointment_time}</>
                                            ) : (
                                                <span className="ml-1 text-amber-500 dark:text-amber-400">— Awaiting time slot</span>
                                            )}
                                        </span>
                                    </div>
                                    
                                    {apt.departments?.name && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <Building2 size={13} className="text-purple-500/80" />
                                            <span className="text-xs font-semibold tracking-wider uppercase text-muted">{apt.departments.name}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {apt.notes && (
                                    <div className="mt-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-glass inline-block max-w-full truncate text-xs text-muted">
                                        <span className="font-semibold text-foreground mr-1">Notes:</span> {apt.notes}
                                    </div>
                                )}
                            </div>

                            {/* Right Side Doctor Contact */}
                             <div className="flex items-center gap-2 shrink-0 sm:self-end mt-2 sm:mt-0">
                                {apt.doctors?.profiles?.full_name ? (
                                    <>
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-medium text-foreground">Dr. {apt.doctors.profiles.full_name}</span>
                                            <span className="text-xs uppercase tracking-wider text-muted font-semibold">{apt.doctors.specialization}</span>
                                        </div>
                                        <div className="w-9 h-9 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500 ml-2">
                                            <Activity size={16} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 text-muted">
                                        <span className="text-sm font-medium">Unassigned</span>
                                        <div className="w-9 h-9 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500 ml-2">
                                            <Loader2 size={16} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Book Appointment">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                        <select
                            value={form.department_id}
                            onChange={(e) => setForm({ ...form, department_id: e.target.value, doctor_id: "" })}
                            className="w-full px-3 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        >
                            <option value="">Select department</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Preferred Doctor with consultation time */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Preferred Doctor <span className="text-muted font-normal">(optional)</span>
                        </label>
                        <select
                            value={form.doctor_id}
                            onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
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
                        <label className="block text-sm font-medium text-foreground mb-1">Preferred Date</label>
                        <input
                            type="date"
                            value={form.appointment_date}
                            onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        />
                        <p className="text-xs text-slate-400 dark:text-muted mt-1">⏰ Time will be assigned by the office based on doctor availability.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Reason</label>
                        <textarea
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            placeholder="Describe your reason for visit..."
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
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
