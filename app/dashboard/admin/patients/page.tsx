"use client";

import { useEffect, useState } from "react";
import { Users, Loader2 } from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

interface Patient {
    id: string;
    user_id: string;
    op_number: string;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string;
    address: string;
    emergency_contact: string;
    created_at: string;
    profiles?: {
        full_name: string;
        phone?: string;
    };
}

export default function AdminPatients() {
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadPatients();
    }, []);

    async function loadPatients() {
        try {
            const res = await fetch("/api/admin/patients");
            const result = await res.json();
            if (res.ok) {
                setPatients(result.patients || []);
            } else {
                toast.error(result.error || "Failed to load patients");
            }
        } catch {
            toast.error("Failed to load patients");
        }
        setLoading(false);
    }

    const filteredPatients = patients.filter((p) => {
        const search = searchTerm.toLowerCase();
        const name = p.profiles?.full_name?.toLowerCase() || "";
        const op = p.op_number?.toLowerCase() || "";
        const phone = p.profiles?.phone?.toLowerCase() || "";
        return name.includes(search) || op.includes(search) || phone.includes(search);
    });

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Patients</h1>
                        <p className="text-muted text-sm mt-1">Manage hospital patients and OP numbers.</p>
                    </div>
                </div>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex sm:items-center justify-between flex-col sm:flex-row gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Users className="text-blue-500" /> Patients Registry
                    </h1>
                    <p className="text-muted text-sm mt-1">
                        View all registered patients and their OP numbers.
                    </p>
                </div>

                <div className="w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search by Name, OP Number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-glass glass text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {filteredPatients.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl border border-glass">
                    <Users className="mx-auto text-slate-300 dark:text-muted mb-3" size={40} />
                    <p className="text-muted text-sm">No patients found.</p>
                </div>
            ) : (
                <div className="glass rounded-2xl border border-glass overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="glass-panel text-muted">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Patient</th>
                                    <th className="px-6 py-4 font-medium">Contact</th>
                                    <th className="px-6 py-4 font-medium">Demographics</th>
                                    <th className="px-6 py-4 font-medium">Registered</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/25 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                                    {(patient.profiles?.full_name || "?")[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {patient.profiles?.full_name || "Unknown"}
                                                    </p>
                                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                                                        {patient.op_number || "OP-Pending"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-foreground">{patient.profiles?.phone || "—"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 text-xs">
                                                <span className="px-2 py-1 rounded glass-panel text-slate-600 dark:text-slate-300 capitalize">
                                                    {patient.gender || "—"}
                                                </span>
                                                {patient.blood_group && (
                                                    <span className="px-2 py-1 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium">
                                                        🩸 {patient.blood_group}
                                                    </span>
                                                )}
                                                {patient.date_of_birth && (
                                                    <span className="px-2 py-1 rounded glass-panel text-slate-600 dark:text-slate-300">
                                                        DOB: {new Date(patient.date_of_birth).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-muted text-xs">
                                                {new Date(patient.created_at).toLocaleDateString()}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
