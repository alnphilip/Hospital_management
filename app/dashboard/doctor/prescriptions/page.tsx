"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

interface Prescription {
    id: string;
    diagnosis: string;
    medications: { name: string; dosage: string; frequency: string }[];
    instructions: string;
    created_at: string;
    patients?: { id: string; user_id: string; profiles?: { full_name: string } };
    [key: string]: unknown;
}

interface AppointmentOption {
    id: string;
    appointment_date: string;
    patient_id: string;
    patients?: { profiles?: { full_name: string } };
    [key: string]: unknown;
}

export default function DoctorPrescriptions() {
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [appointments, setAppointments] = useState<AppointmentOption[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        appointment_id: "",
        diagnosis: "",
        med_name: "",
        med_dosage: "",
        med_frequency: "",
        instructions: "",
    });

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/doctor/data?type=prescriptions");
            const result = await res.json();
            if (res.ok) {
                setPrescriptions(result.prescriptions || []);
                setAppointments(result.appointments || []);
            }
        } catch {}
        setLoading(false);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const selectedApt = appointments.find((a) => a.id === form.appointment_id);
        if (!selectedApt) { toast.error("Select an appointment."); setSubmitting(false); return; }

        try {
            const res = await fetch("/api/doctor/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    appointment_id: form.appointment_id,
                    patient_id: selectedApt.patient_id,
                    diagnosis: form.diagnosis,
                    medications: form.med_name ? [{ name: form.med_name, dosage: form.med_dosage, frequency: form.med_frequency }] : [],
                    instructions: form.instructions,
                }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Prescription created!");
                setShowModal(false);
                setForm({ appointment_id: "", diagnosis: "", med_name: "", med_dosage: "", med_frequency: "", instructions: "" });
                loadData();
            } else {
                toast.error(result.error || "Failed to create prescription");
            }
        } catch {
            toast.error("Failed to create prescription");
        }
        setSubmitting(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prescriptions</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prescriptions</h1>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/25 transition-all">
                    <Plus size={16} /> New Prescription
                </button>
            </div>

            {prescriptions.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 text-sm">No prescriptions yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map((rx) => (
                        <div key={rx.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{rx.diagnosis || "Prescription"}</h3>
                                {rx.patients?.profiles?.full_name && (
                                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">👤 {rx.patients.profiles.full_name}</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{new Date(rx.created_at).toLocaleDateString()}</p>
                            {rx.medications?.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    {rx.medications.map((m, i) => (
                                        <p key={i} className="text-sm text-slate-600 dark:text-slate-400">💊 {m.name} — {m.dosage} ({m.frequency})</p>
                                    ))}
                                </div>
                            )}
                            {rx.instructions && <p className="text-xs text-slate-400 mt-2">📝 {rx.instructions}</p>}
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Prescription">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Appointment</label>
                        <select value={form.appointment_id} onChange={(e) => setForm({ ...form, appointment_id: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                            <option value="">Select</option>
                            {appointments.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.appointment_date} — {a.patients?.profiles?.full_name || a.id.slice(0, 8)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Diagnosis</label>
                        <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <input type="text" placeholder="Med name" value={form.med_name} onChange={(e) => setForm({ ...form, med_name: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none" />
                        <input type="text" placeholder="Dosage" value={form.med_dosage} onChange={(e) => setForm({ ...form, med_dosage: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none" />
                        <input type="text" placeholder="Frequency" value={form.med_frequency} onChange={(e) => setForm({ ...form, med_frequency: e.target.value })} className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
                        <textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none focus:outline-none" />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create Prescription"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
