"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { CheckCircle, FileText, Plus, Trash2, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    notes: string;
    patient_id: string;
    patients?: { id: string; user_id: string; profiles?: { full_name: string } };
    departments?: { name: string };
    [key: string]: unknown;
}

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
}

export default function DoctorAppointments() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    // Prescription modal state
    const [showRxModal, setShowRxModal] = useState(false);
    const [rxAppointment, setRxAppointment] = useState<Appointment | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [diagnosis, setDiagnosis] = useState("");
    const [medications, setMedications] = useState<Medication[]>([{ name: "", dosage: "", frequency: "" }]);
    const [instructions, setInstructions] = useState("");

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/doctor/data?type=appointments");
            const result = await res.json();
            if (res.ok) {
                setAppointments(result.appointments || []);
            }
        } catch { }
        setLoading(false);
    }

    async function markComplete(id: string) {
        try {
            const res = await fetch("/api/doctor/data", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "complete", appointmentId: id }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Marked as completed!");
                loadData();
            } else {
                toast.error(result.error || "Failed to update");
            }
        } catch {
            toast.error("Failed to update appointment");
        }
    }

    function openPrescriptionModal(apt: Appointment) {
        setRxAppointment(apt);
        setDiagnosis("");
        setMedications([{ name: "", dosage: "", frequency: "" }]);
        setInstructions("");
        setShowRxModal(true);
    }

    function addMedication() {
        setMedications([...medications, { name: "", dosage: "", frequency: "" }]);
    }

    function removeMedication(index: number) {
        setMedications(medications.filter((_, i) => i !== index));
    }

    function updateMedication(index: number, field: keyof Medication, value: string) {
        const updated = [...medications];
        updated[index] = { ...updated[index], [field]: value };
        setMedications(updated);
    }

    async function handleCreatePrescription(e: React.FormEvent) {
        e.preventDefault();
        if (!rxAppointment) return;
        setSubmitting(true);

        const validMeds = medications.filter((m) => m.name.trim() !== "");

        try {
            const res = await fetch("/api/doctor/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    appointment_id: rxAppointment.id,
                    patient_id: rxAppointment.patient_id || rxAppointment.patients?.id,
                    diagnosis,
                    medications: validMeds,
                    instructions,
                }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Prescription created!");
                setShowRxModal(false);
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Appointments</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Assigned Appointments 📋
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    View your appointments and write prescriptions.
                </p>
            </div>

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
                                {apt.patients?.profiles?.full_name && (
                                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">👤 Patient: {apt.patients.profiles.full_name}</p>
                                )}
                                {apt.departments?.name && (
                                    <p className="text-xs text-slate-400 mt-0.5">🏥 {apt.departments.name}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <StatusBadge status={apt.status} />
                                {(apt.status === "assigned" || apt.status === "completed") && (
                                    <button
                                        onClick={() => openPrescriptionModal(apt)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-950/60 transition"
                                    >
                                        <FileText size={14} /> Prescription
                                    </button>
                                )}
                                {apt.status === "assigned" && (
                                    <button
                                        onClick={() => markComplete(apt.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition"
                                    >
                                        <CheckCircle size={14} /> Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Prescription Modal */}
            <Modal
                isOpen={showRxModal}
                onClose={() => setShowRxModal(false)}
                title={`Prescription for ${rxAppointment?.patients?.profiles?.full_name || "Patient"}`}
                size="lg"
            >
                <form onSubmit={handleCreatePrescription} className="space-y-4">
                    {/* Appointment Info */}
                    <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            📅 {rxAppointment?.appointment_date} &nbsp;⏰ {rxAppointment?.appointment_time} &nbsp;— {rxAppointment?.reason || "Consultation"}
                        </p>
                    </div>

                    {/* Diagnosis */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Diagnosis</label>
                        <input
                            type="text"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            placeholder="e.g. Acute bronchitis"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        />
                    </div>

                    {/* Medications — Multi-row */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Medications</label>
                            <button
                                type="button"
                                onClick={addMedication}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-950/60 transition"
                            >
                                <Plus size={13} /> Add Medicine
                            </button>
                        </div>
                        <div className="space-y-2">
                            {medications.map((med, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="grid grid-cols-3 gap-2 flex-1">
                                        <input
                                            type="text"
                                            placeholder="Medicine name"
                                            value={med.name}
                                            onChange={(e) => updateMedication(index, "name", e.target.value)}
                                            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Dosage"
                                            value={med.dosage}
                                            onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                                            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Frequency"
                                            value={med.frequency}
                                            onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                                            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                        />
                                    </div>
                                    {medications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMedication(index)}
                                            className="flex items-center justify-center w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition shrink-0"
                                            aria-label="Remove medication"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instructions</label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            rows={2}
                            placeholder="Additional instructions for the patient..."
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? (
                            <><Loader2 size={16} className="animate-spin" /> Creating...</>
                        ) : (
                            "Create Prescription"
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
