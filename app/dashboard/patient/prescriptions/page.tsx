"use client";

import { useEffect, useState } from "react";
import { TableSkeleton } from "@/components/ui/Skeleton";

interface Prescription {
    id: string;
    diagnosis: string;
    medications: { name: string; dosage: string; frequency: string }[];
    instructions: string;
    created_at: string;
    doctors?: { id: string; user_id: string; specialization: string; profiles?: { full_name: string } };
    appointments?: { appointment_date: string };
    [key: string]: unknown;
}

export default function PatientPrescriptions() {
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/patient/data?type=prescriptions");
            const result = await res.json();
            if (res.ok) {
                setPrescriptions(result.prescriptions || []);
            }
        } catch {}
        setLoading(false);
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
            <h1 className="text-2xl font-bold text-foreground">My Prescriptions</h1>

            {prescriptions.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl border border-glass">
                    <p className="text-muted text-sm">No prescriptions found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {prescriptions.map((rx) => (
                        <div
                            key={rx.id}
                            className="glass rounded-2xl border border-glass p-5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        {rx.diagnosis || "General Prescription"}
                                    </h3>
                                    <p className="text-xs text-muted mt-0.5">
                                        {new Date(rx.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                {rx.doctors?.profiles?.full_name && (
                                    <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                                        🩺 Dr. {rx.doctors.profiles.full_name}
                                    </span>
                                )}
                            </div>

                            {rx.doctors?.specialization && (
                                <p className="text-xs text-muted mb-2">Specialization: {rx.doctors.specialization}</p>
                            )}

                            {rx.medications && rx.medications.length > 0 && (
                                <div className="space-y-2 mb-3">
                                    {rx.medications.map((med, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 px-3 py-2 glass-panel rounded-xl text-sm"
                                        >
                                            <span className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xs font-bold">
                                                {i + 1}
                                            </span>
                                            <div>
                                                <span className="font-medium text-foreground">{med.name}</span>
                                                <span className="text-muted ml-2">
                                                    {med.dosage} — {med.frequency}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {rx.instructions && (
                                <p className="text-xs text-muted bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg">
                                    💡 {rx.instructions}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
