"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Building2, Loader2, Users } from "lucide-react";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface Department {
    id: string;
    name: string;
    description: string;
    doctor_count?: number;
}

export default function PatientDepartments() {
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const supabase = createClient();
        const { data: depts } = await supabase
            .from("departments")
            .select("id, name, description")
            .order("name");

        // Get doctor count per department
        const { data: doctors } = await supabase
            .from("doctors")
            .select("department_id");

        const deptList = (depts || []).map((d) => ({
            ...d,
            doctor_count: (doctors || []).filter((doc) => doc.department_id === d.id).length,
        }));

        setDepartments(deptList);
        setLoading(false);
    }

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
                    Browse available hospital departments.
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
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-200"
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
        </div>
    );
}
