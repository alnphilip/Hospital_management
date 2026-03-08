"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Plus, Loader2, UserPlus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

interface Doctor {
    id: string;
    user_id: string;
    specialization: string;
    qualification: string;
    experience_years: number;
    is_available: boolean;
    profiles?: { full_name: string; phone: string };
    departments?: { name: string };
    [key: string]: unknown;
}

interface Department {
    id: string;
    name: string;
    [key: string]: unknown;
}

export default function AdminDoctors() {
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Create doctor account form
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        department_id: "",
        specialization: "",
        qualification: "",
        experience_years: 0,
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const supabase = createClient();
        const { data: docs } = await supabase
            .from("doctors")
            .select("*, profiles(full_name, phone), departments(name)");
        setDoctors(docs || []);

        const { data: depts } = await supabase
            .from("departments")
            .select("id, name")
            .order("name");
        setDepartments(depts || []);

        setLoading(false);
    }

    async function handleCreateDoctor(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch("/api/admin/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    full_name: form.full_name,
                    phone: form.phone,
                    role: "doctor",
                    extra: {
                        department_id: form.department_id || null,
                        specialization: form.specialization,
                        qualification: form.qualification,
                        experience_years: form.experience_years,
                    },
                }),
            });

            const result = await res.json();

            if (!res.ok && res.status !== 207) {
                toast.error(result.error || "Failed to create doctor account");
            } else if (res.status === 207) {
                toast.error(result.error);
            } else {
                toast.success("Doctor account created successfully!");
                setShowModal(false);
                setForm({
                    full_name: "",
                    email: "",
                    password: "",
                    phone: "",
                    department_id: "",
                    specialization: "",
                    qualification: "",
                    experience_years: 0,
                });
                loadData();
            }
        } catch {
            toast.error("Network error. Please try again.");
        }

        setSubmitting(false);
    }

    async function toggleAvailability(id: string, current: boolean) {
        const supabase = createClient();
        const { error } = await supabase
            .from("doctors")
            .update({ is_available: !current })
            .eq("id", id);
        if (error) toast.error(error.message);
        else {
            toast.success("Updated!");
            loadData();
        }
    }

    const inputClasses =
        "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50";

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Doctors
                </h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Manage Doctors
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25 transition-all"
                >
                    <UserPlus size={16} /> Create Doctor Account
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                    <div
                        key={doc.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {doc.profiles?.full_name || "Unknown"}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {doc.specialization}
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    toggleAvailability(doc.id, doc.is_available)
                                }
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition ${
                                    doc.is_available
                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                        : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                }`}
                            >
                                {doc.is_available ? "Available" : "Unavailable"}
                            </button>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            <p>🏥 {doc.departments?.name || "No dept"}</p>
                            <p>🎓 {doc.qualification || "N/A"}</p>
                            <p>📅 {doc.experience_years}yr exp</p>
                            <p>📞 {doc.profiles?.phone || "N/A"}</p>
                        </div>
                    </div>
                ))}
            </div>

            {doctors.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 text-sm">
                        No doctors yet. Create one using the button above.
                    </p>
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Create Doctor Account"
                size="lg"
            >
                <form onSubmit={handleCreateDoctor} className="space-y-4">
                    <div className="bg-sky-50 dark:bg-sky-950/30 rounded-xl p-3 text-xs text-sky-700 dark:text-sky-300 flex items-start gap-2">
                        <UserPlus size={14} className="mt-0.5 shrink-0" />
                        <span>
                            This creates a new Supabase auth account with role
                            &quot;doctor&quot; and a linked doctor record. The
                            doctor can log in immediately with these credentials.
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={form.full_name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        full_name: e.target.value,
                                    })
                                }
                                required
                                placeholder="Dr. John Smith"
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                required
                                placeholder="doctor@hospital.com"
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Password *
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        password: e.target.value,
                                    })
                                }
                                required
                                minLength={6}
                                placeholder="Min 6 characters"
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) =>
                                    setForm({ ...form, phone: e.target.value })
                                }
                                placeholder="+91 98765 43210"
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Department
                        </label>
                        <select
                            value={form.department_id}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    department_id: e.target.value,
                                })
                            }
                            className={inputClasses}
                        >
                            <option value="">None</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Specialization
                            </label>
                            <input
                                type="text"
                                value={form.specialization}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        specialization: e.target.value,
                                    })
                                }
                                placeholder="e.g. Cardiology"
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Qualification
                            </label>
                            <input
                                type="text"
                                value={form.qualification}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        qualification: e.target.value,
                                    })
                                }
                                placeholder="e.g. MBBS, MD"
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Experience (years)
                        </label>
                        <input
                            type="number"
                            value={form.experience_years}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    experience_years:
                                        parseInt(e.target.value) || 0,
                                })
                            }
                            min={0}
                            className={inputClasses}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />{" "}
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} /> Create Doctor Account
                            </>
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
