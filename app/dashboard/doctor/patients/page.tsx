"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, FileText, ChevronDown, ChevronUp, Plus, Loader2, Pill } from "lucide-react";
import { CardSkeleton } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";

interface AppointmentBrief {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
}

interface PrescriptionBrief {
    id: string;
    appointment_id: string;
    diagnosis: string;
    medications: { name: string; dosage: string; frequency: string }[];
    instructions: string;
    created_at: string;
}

interface Patient {
    id: string;
    user_id: string;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string;
    profiles?: { full_name: string };
    appointment_count?: number;
    last_appointment?: string | null;
    appointments?: AppointmentBrief[];
    prescriptions?: PrescriptionBrief[];
}

export default function DoctorPatients() {
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Prescription modal state
    const [showRxModal, setShowRxModal] = useState(false);
    const [rxPatient, setRxPatient] = useState<Patient | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [rxForm, setRxForm] = useState({
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
            const res = await fetch("/api/doctor/data?type=patients");
            const result = await res.json();
            if (res.ok) {
                setPatients(result.patients || []);
            }
        } catch {}
        setLoading(false);
    }

    function openPrescriptionModal(patient: Patient) {
        setRxPatient(patient);
        const eligibleApts = (patient.appointments || []).filter((a) =>
            ["assigned", "completed"].includes(a.status)
        );
        setRxForm({
            appointment_id: eligibleApts.length === 1 ? eligibleApts[0].id : "",
            diagnosis: "",
            med_name: "",
            med_dosage: "",
            med_frequency: "",
            instructions: "",
        });
        setShowRxModal(true);
    }

    async function handleCreatePrescription(e: React.FormEvent) {
        e.preventDefault();
        if (!rxPatient) return;
        setSubmitting(true);

        if (!rxForm.appointment_id) {
            toast.error("Select an appointment.");
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/doctor/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    appointment_id: rxForm.appointment_id,
                    patient_id: rxPatient.id,
                    diagnosis: rxForm.diagnosis,
                    medications: rxForm.med_name
                        ? [{ name: rxForm.med_name, dosage: rxForm.med_dosage, frequency: rxForm.med_frequency }]
                        : [],
                    instructions: rxForm.instructions,
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Patients</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Patients 👥</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Click a patient to view history and write prescriptions.
                </p>
            </div>

            {patients.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No patients assigned yet.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Patients will appear here once appointments are assigned to you.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {patients.map((patient) => {
                        const isExpanded = expandedId === patient.id;
                        const eligibleApts = (patient.appointments || []).filter((a) =>
                            ["assigned", "completed"].includes(a.status)
                        );

                        return (
                            <div
                                key={patient.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200"
                            >
                                {/* Clickable header */}
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : patient.id)}
                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 text-sm font-bold shrink-0">
                                            {(patient.profiles?.full_name || "?")[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                {patient.profiles?.full_name || "Unknown"}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                <span className="capitalize">{patient.gender || "—"}</span>
                                                {patient.blood_group && <span>🩸 {patient.blood_group}</span>}
                                                {patient.date_of_birth && (
                                                    <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                                            {patient.appointment_count} visit{patient.appointment_count !== 1 ? "s" : ""}
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp size={18} className="text-slate-400" />
                                        ) : (
                                            <ChevronDown size={18} className="text-slate-400" />
                                        )}
                                    </div>
                                </button>

                                {/* Expanded content */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                        {/* Action button */}
                                        <div className="flex items-center justify-between pt-4">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {patient.last_appointment
                                                    ? `Last visit: ${new Date(patient.last_appointment).toLocaleDateString()}`
                                                    : "No visits yet"}
                                            </p>
                                            {eligibleApts.length > 0 && (
                                                <button
                                                    onClick={() => openPrescriptionModal(patient)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg hover:from-teal-600 hover:to-emerald-600 shadow-md shadow-teal-500/20 transition-all"
                                                >
                                                    <Plus size={14} /> Write Prescription
                                                </button>
                                            )}
                                        </div>

                                        {/* Appointments */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                                <Calendar size={13} /> Appointments
                                            </h4>
                                            {(patient.appointments || []).length === 0 ? (
                                                <p className="text-xs text-slate-400 pl-5">No appointments.</p>
                                            ) : (
                                                <div className="space-y-1.5 pl-5">
                                                    {(patient.appointments || []).map((apt) => (
                                                        <div
                                                            key={apt.id}
                                                            className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                                                        >
                                                            <span className="text-slate-700 dark:text-slate-300">
                                                                {apt.appointment_date} · {apt.appointment_time} — {apt.reason || "Consultation"}
                                                            </span>
                                                            <StatusBadge status={apt.status} />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Prescriptions */}
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                                <Pill size={13} /> Prescriptions
                                            </h4>
                                            {(patient.prescriptions || []).length === 0 ? (
                                                <p className="text-xs text-slate-400 pl-5">No prescriptions written yet.</p>
                                            ) : (
                                                <div className="space-y-2 pl-5">
                                                    {(patient.prescriptions || []).map((rx) => (
                                                        <div
                                                            key={rx.id}
                                                            className="px-3 py-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40"
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <p className="text-xs font-medium text-slate-900 dark:text-white">
                                                                    {rx.diagnosis || "Prescription"}
                                                                </p>
                                                                <span className="text-[10px] text-slate-400">
                                                                    {new Date(rx.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            {rx.medications?.length > 0 && (
                                                                <div className="mt-1.5 space-y-0.5">
                                                                    {rx.medications.map((m, i) => (
                                                                        <p key={i} className="text-xs text-slate-600 dark:text-slate-400">
                                                                            💊 {m.name} — {m.dosage} ({m.frequency})
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {rx.instructions && (
                                                                <p className="text-[11px] text-slate-500 mt-1">📝 {rx.instructions}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Prescription Modal */}
            <Modal
                isOpen={showRxModal}
                onClose={() => setShowRxModal(false)}
                title={`Prescription for ${rxPatient?.profiles?.full_name || "Patient"}`}
            >
                <form onSubmit={handleCreatePrescription} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Appointment
                        </label>
                        <select
                            value={rxForm.appointment_id}
                            onChange={(e) => setRxForm({ ...rxForm, appointment_id: e.target.value })}
                            required
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        >
                            <option value="">Select appointment</option>
                            {(rxPatient?.appointments || [])
                                .filter((a) => ["assigned", "completed"].includes(a.status))
                                .map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.appointment_date} · {a.appointment_time} — {a.reason || "Consultation"}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Diagnosis
                        </label>
                        <input
                            type="text"
                            value={rxForm.diagnosis}
                            onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                            placeholder="e.g. Acute bronchitis"
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Medication
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="text"
                                placeholder="Med name"
                                value={rxForm.med_name}
                                onChange={(e) => setRxForm({ ...rxForm, med_name: e.target.value })}
                                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Dosage"
                                value={rxForm.med_dosage}
                                onChange={(e) => setRxForm({ ...rxForm, med_dosage: e.target.value })}
                                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Frequency"
                                value={rxForm.med_frequency}
                                onChange={(e) => setRxForm({ ...rxForm, med_frequency: e.target.value })}
                                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Instructions
                        </label>
                        <textarea
                            value={rxForm.instructions}
                            onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                            rows={2}
                            placeholder="Additional instructions..."
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none focus:outline-none"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Creating...
                            </>
                        ) : (
                            "Create Prescription"
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
