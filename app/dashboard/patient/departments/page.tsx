"use client";

import { useEffect, useState } from "react";
import { Building2, Users } from "lucide-react";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface Department {
    id: string;
    name: string;
    description: string;
    doctor_count?: number;
}

interface Doctor {
    id: string;
    specialization: string;
    is_active: boolean;
    profiles?: { full_name: string };
    departments?: { name: string };
    department_id: string;
}

export default function PatientDepartments() {
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/patient/data?type=departments");
            const result = await res.json();
            if (res.ok) {
                const allDoctors: Doctor[] = result.doctors || [];
                setDoctors(allDoctors);
                const deptList = (result.departments || []).map((d: Department) => ({
                    ...d,
                    doctor_count: allDoctors.filter((doc) => doc.department_id === d.id).length,
                }));
                setDepartments(deptList);
            }
        } catch {}
        setLoading(false);
    }

    const filteredDoctors = selectedDept
        ? doctors.filter((d) => d.department_id === selectedDept)
        : [];

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Departments</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Departments 🏥</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                    Browse available hospital departments and their doctors.
                </p>
            </div>

            {departments.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Building2 className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={40} />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No departments found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
                        <div
                            key={dept.id}
                            onClick={() => setSelectedDept(selectedDept === dept.id ? null : dept.id)}
                            className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-200 cursor-pointer ${
                                selectedDept === dept.id
                                    ? "border-teal-500 dark:border-teal-500"
                                    : "border-slate-200 dark:border-slate-800"
                            }`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shrink-0">
                                    <Building2 className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {dept.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {dept.description || "No description available"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <Users size={14} />
                                <span>{dept.doctor_count} doctor{dept.doctor_count !== 1 ? "s" : ""} available</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedDept && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                        Doctors in {departments.find((d) => d.id === selectedDept)?.name}
                    </h2>
                    {filteredDoctors.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">No doctors in this department.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filteredDoctors.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 text-sm font-bold">
                                        {(doc.profiles?.full_name || "?")[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                            Dr. {doc.profiles?.full_name || "Unknown"}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{doc.specialization}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
