"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { CheckCircle, FileText, Plus, Trash2, Loader2, Clock, Users, Building2, Activity } from "lucide-react";
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
                <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Context/Subtitle */}
            <div>
                <p className="text-muted text-[15px] font-medium tracking-wide">
                    View your appointments and write prescriptions.
                </p>
            </div>

            {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl border border-dashed border-glass">
                    <CheckCircle size={48} className="text-muted opacity-50 mb-4" />
                    <p className="text-base text-muted font-medium">No assigned appointments.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between p-5 rounded-2xl bg-white dark:bg-[#0f172a] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800/80 transition-all hover:scale-[1.01] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)]">
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center gap-3">
                                    <p className="text-base font-semibold text-foreground">{apt.reason || "Consultation"}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted font-medium mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={15} className="text-primary opacity-80" />
                                        <span>
                                            {apt.appointment_date} {apt.appointment_time && apt.appointment_time !== "00:00:00" ? ` at ${apt.appointment_time}` : ""}
                                        </span>
                                    </div>
                                    {apt.patients?.profiles?.full_name && (
                                        <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                                            <Users size={14} className="opacity-80" />
                                            <span className="text-xs font-semibold">Patient: {apt.patients.profiles.full_name}</span>
                                        </div>
                                    )}
                                    {apt.departments?.name && (
                                        <div className="flex items-center gap-1.5 text-muted">
                                            <Building2 size={13} className="opacity-80" />
                                            <span className="text-xs font-semibold tracking-wider uppercase">{apt.departments.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <StatusBadge status={apt.status} />
                                <div className="flex items-center gap-2">
                                    {(apt.status === "assigned" || apt.status === "completed") && (
                                        <button
                                            onClick={() => openPrescriptionModal(apt)}
                                            className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 text-violet-600 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-400 rounded-xl hover:bg-violet-100 dark:hover:bg-violet-950/60 transition shadow-sm border border-violet-200/50 dark:border-violet-800/30"
                                            title="Prescription"
                                        >
                                            <FileText size={16} /> <span className="hidden sm:inline-block ml-1.5 text-sm font-semibold">Prescription</span>
                                        </button>
                                    )}
                                    {apt.status === "assigned" && (
                                        <button
                                            onClick={() => markComplete(apt.id)}
                                            className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition shadow-sm border border-emerald-200/50 dark:border-emerald-800/30"
                                            title="Mark as Complete"
                                        >
                                            <CheckCircle size={16} /> <span className="hidden sm:inline-block ml-1.5 text-sm font-semibold">Complete</span>
                                        </button>
                                    )}
                                </div>
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
                <form onSubmit={handleCreatePrescription} className="space-y-6">
                    {/* Appointment Info Context Panel */}
                    <div className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 mb-6">
                        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-400">
                            <Clock size={16} className="text-primary/70 shrink-0" />
                            <span>{rxAppointment?.appointment_date} <span className="opacity-30 mx-0.5">|</span> {rxAppointment?.appointment_time}</span>
                        </div>
                        <div className="w-px h-3 bg-slate-300 dark:bg-slate-700 mx-1" />
                        <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600 dark:text-slate-400">
                            <Building2 size={16} className="text-secondary/70 shrink-0" />
                            <span>{rxAppointment?.reason || "Consultation"}</span>
                        </div>
                    </div>

                    {/* Diagnosis Section */}
                    <div className="space-y-2 mb-6">
                        <label className="text-[12px] font-bold text-muted uppercase tracking-wider ml-1">Clinical Diagnosis</label>
                        <div className="relative group">
                            <Activity size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted/50 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="Nature of the clinical diagnosis..."
                                className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary transition-all"
                            />
                        </div>
                    </div>

                    {/* Medications Section */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[12px] font-bold text-muted uppercase tracking-wider">Medications</label>
                            <button
                                type="button"
                                onClick={addMedication}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 rounded-lg hover:bg-teal-500/20 transition-all border border-teal-500/10"
                            >
                                <Plus size={14} strokeWidth={2.5} /> Add Medicine
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {medications.map((med, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="grid grid-cols-4 gap-3 flex-1">
                                        <div className="col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Medicine Name"
                                                value={med.name}
                                                onChange={(e) => updateMedication(index, "name", e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="text"
                                                placeholder="Dosage"
                                                value={med.dosage}
                                                onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <input
                                                type="text"
                                                placeholder="Frequency"
                                                value={med.frequency}
                                                onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>
                                    {medications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMedication(index)}
                                            className="p-2.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition shrink-0"
                                            aria-label="Remove medication"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div className="space-y-2 mb-8">
                        <label className="text-[12px] font-bold text-muted uppercase tracking-wider ml-1">Special Instructions</label>
                        <textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            rows={3}
                            placeholder="Clinical advice for the patient..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-foreground text-sm resize-none focus:outline-none focus:border-primary transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
                        <button
                            type="button"
                            onClick={() => setShowRxModal(false)}
                            className="flex-1 h-12 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 opacity-70 border border-slate-200 dark:border-slate-800 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[1.5] h-12 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {submitting ? (
                                <><Loader2 size={18} className="animate-spin" /> Processing...</>
                            ) : (
                                "Save Prescription"
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
