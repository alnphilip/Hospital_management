"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Users, Loader2, Calendar, FileText } from "lucide-react";
import { CardSkeleton } from "@/components/ui/Skeleton";
import StatusBadge from "@/components/ui/StatusBadge";

interface Patient {
    id: string;
    user_id: string;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string;
    profiles?: { full_name: string };
    appointment_count?: number;
    last_appointment?: string | null;
}

export default function DoctorPatients() {
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<Patient[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get doctor record for current user
        const { data: doctor } = await supabase
            .from("doctors")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!doctor) {
            setLoading(false);
            return;
        }

        // Get all appointments for this doctor to find patients
        const { data: appointments } = await supabase
            .from("appointments")
            .select("patient_id, appointment_date, status")
            .eq("doctor_id", doctor.id)
            .order("appointment_date", { ascending: false });

        if (!appointments || appointments.length === 0) {
            setLoading(false);
            return;
        }

        // Get unique patient IDs
        const patientIds = [...new Set(appointments.map((a) => a.patient_id))];

        // Fetch patient details
        const { data: patientData } = await supabase
            .from("patients")
            .select("*, profiles(full_name)")
            .in("id", patientIds);

        // Enrich with appointment counts
        const enriched = (patientData || []).map((p) => {
            const patientAppts = appointments.filter((a) => a.patient_id === p.id);
            return {
                ...p,
                appointment_count: patientAppts.length,
                last_appointment: patientAppts[0]?.appointment_date || null,
            };
        });

        setPatients(enriched);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Patients</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    Patients assigned to you via appointments.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.map((patient) => (
                        <div
                            key={patient.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {patient.profiles?.full_name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                                        {patient.gender || "—"} {patient.blood_group ? `• ${patient.blood_group}` : ""}
                                    </p>
                                </div>
                                <div className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                                    {patient.appointment_count} visit{patient.appointment_count !== 1 ? "s" : ""}
                                </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                                {patient.date_of_birth && (
                                    <p className="flex items-center gap-1.5">
                                        <Calendar size={12} />
                                        DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                                    </p>
                                )}
                                {patient.last_appointment && (
                                    <p className="flex items-center gap-1.5">
                                        <FileText size={12} />
                                        Last visit: {new Date(patient.last_appointment).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
