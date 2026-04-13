"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
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

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
}

export default function DoctorPrescriptions() {
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [appointments, setAppointments] = useState<AppointmentOption[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [appointmentId, setAppointmentId] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [medications, setMedications] = useState<Medication[]>([{ name: "", dosage: "", frequency: "" }]);
    const [instructions, setInstructions] = useState("");

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/doctor/data?type=prescriptions");
            const result = await res.json();
            if (res.ok) {
                setPrescriptions(result.prescriptions || []);
                setAppointments(result.appointments || []);
            }
        } catch { }
        setLoading(false);
    }

    function resetForm() {
        setAppointmentId("");
        setDiagnosis("");
        setMedications([{ name: "", dosage: "", frequency: "" }]);
        setInstructions("");
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

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const selectedApt = appointments.find((a) => a.id === appointmentId);
        if (!selectedApt) { toast.error("Select an appointment."); setSubmitting(false); return; }

        const validMeds = medications.filter((m) => m.name.trim() !== "");

        try {
            const res = await fetch("/api/doctor/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    appointment_id: appointmentId,
                    patient_id: selectedApt.patient_id,
                    diagnosis,
                    medications: validMeds,
                    instructions,
                }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Prescription created!");
                setShowModal(false);
                resetForm();
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
                <h1 className="text-2xl font-bold text-foreground">Prescriptions</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Prescriptions</h1>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/25 transition-all">
                    <Plus size={16} /> New Prescription
                </button>
            </div>

            {prescriptions.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl border border-glass">
                    <p className="text-muted text-sm">No prescriptions yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map((rx) => (
                        <div key={rx.id} className="glass rounded-2xl border border-glass p-5">
                            <div className="flex items-start justify-between mb-1">
                                <h3 className="text-sm font-semibold text-foreground">{rx.diagnosis || "Prescription"}</h3>
                                {rx.patients?.profiles?.full_name && (
                                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">👤 {rx.patients.profiles.full_name}</span>
                                )}
                            </div>
                            <p className="text-xs text-muted mt-0.5">{new Date(rx.created_at).toLocaleDateString()}</p>
                            {rx.medications?.length > 0 && (
                                <div className="mt-3 space-y-1">
                                    {rx.medications.map((m, i) => (
                                        <p key={i} className="text-sm text-muted">💊 {m.name} — {m.dosage} ({m.frequency})</p>
                                    ))}
                                </div>
                            )}
                            {rx.instructions && <p className="text-xs text-muted mt-2">📝 {rx.instructions}</p>}
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Prescription" size="lg">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Appointment</label>
                        <select value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                            <option value="">Select</option>
                            {appointments.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.appointment_date} — {a.patients?.profiles?.full_name || a.id.slice(0, 8)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Diagnosis</label>
                        <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Acute bronchitis" className="w-full px-3 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                    </div>

                    {/* Medications — Multi-row */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-foreground">Medications</label>
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
                                        <input type="text" placeholder="Medicine name" value={med.name} onChange={(e) => updateMedication(index, "name", e.target.value)} className="px-3 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                                        <input type="text" placeholder="Dosage" value={med.dosage} onChange={(e) => updateMedication(index, "dosage", e.target.value)} className="px-3 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                                        <input type="text" placeholder="Frequency" value={med.frequency} onChange={(e) => updateMedication(index, "frequency", e.target.value)} className="px-3 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
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

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Instructions</label>
                        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} placeholder="Additional instructions..." className="w-full px-3 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : "Create Prescription"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
