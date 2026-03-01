"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
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
    [key: string]: unknown;
}

interface Department {
    id: string;
    name: string;
    [key: string]: unknown;
}

export default function PatientAppointments() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [patientId, setPatientId] = useState<string | null>(null);

    const [form, setForm] = useState({
        department_id: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: patient } = await supabase
            .from("patients")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (patient) {
            setPatientId(patient.id);
            const { data: apts } = await supabase
                .from("appointments")
                .select("*")
                .eq("patient_id", patient.id)
                .order("appointment_date", { ascending: false });
            setAppointments(apts || []);
        }

        const { data: depts } = await supabase.from("departments").select("*").order("name");
        setDepartments(depts || []);
        setLoading(false);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!patientId) {
            toast.error("Patient profile not found. Please contact support.");
            return;
        }
        setSubmitting(true);
        const supabase = createClient();

        const { error } = await supabase.from("appointments").insert({
            patient_id: patientId,
            department_id: form.department_id || null,
            appointment_date: form.appointment_date,
            appointment_time: form.appointment_time,
            reason: form.reason,
            status: "pending",
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Appointment booked!");
            setShowModal(false);
            setForm({ department_id: "", appointment_date: "", appointment_time: "", reason: "" });
            loadData();
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
                                    📅 {apt.appointment_date} &nbsp;⏰ {apt.appointment_time}
                                </p>
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
                            onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        >
                            <option value="">Select department</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                            <input
                                type="date"
                                value={form.appointment_date}
                                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                                required
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Time</label>
                            <input
                                type="time"
                                value={form.appointment_time}
                                onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                                required
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                            />
                        </div>
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
