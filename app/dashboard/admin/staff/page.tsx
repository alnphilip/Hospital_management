"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

interface StaffMember {
    id: string;
    user_id: string;
    position: string;
    shift: string;
    created_at: string;
    profiles?: { full_name: string; phone: string };
    departments?: { name: string };
    [key: string]: unknown;
}

interface Department {
    id: string;
    name: string;
    [key: string]: unknown;
}

export default function AdminStaff() {
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        department_id: "",
        position: "",
        shift: "day",
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/admin/data?type=staff");
            const result = await res.json();
            if (res.ok) {
                setStaff(result.staff || []);
                setDepartments(result.departments || []);
            }
        } catch {
            console.error("Failed to load staff");
        }
        setLoading(false);
    }

    async function handleCreateStaff(e: React.FormEvent) {
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
                    role: "staff",
                    extra: {
                        department_id: form.department_id && form.department_id !== "general_staff" ? form.department_id : null,
                        position: form.department_id === "general_staff" && !form.position ? "General Staff" : form.position,
                        shift: form.shift,
                    },
                }),
            });

            const result = await res.json();

            if (!res.ok && res.status !== 207) {
                toast.error(result.error || "Failed to create staff account");
            } else if (res.status === 207) {
                toast.error(result.error);
            } else {
                toast.success("Staff account created successfully!");
                setShowModal(false);
                setForm({
                    full_name: "",
                    email: "",
                    password: "",
                    phone: "",
                    department_id: "",
                    position: "",
                    shift: "day",
                });
                loadData();
            }
        } catch {
            toast.error("Network error. Please try again.");
        }

        setSubmitting(false);
    }

    const inputClasses =
        "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50";

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Staff
                </h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Office Staff
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl hover:from-purple-600 hover:to-violet-600 shadow-lg shadow-purple-500/25 transition-all"
                >
                    <UserPlus size={16} /> Create Staff Account
                </button>
            </div>

            {staff.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-400 text-sm">
                        No staff members yet. Create one using the button above.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staff.map((s) => (
                        <div
                            key={s.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                                    {s.profiles?.full_name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "S"}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        {s.profiles?.full_name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {s.position || "Staff"}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                                <p>
                                    🏥{" "}
                                    {s.departments?.name || "General Staff"}
                                </p>
                                <p>
                                    🕐 {s.shift?.charAt(0).toUpperCase()}
                                    {s.shift?.slice(1)} shift
                                </p>
                                <p>📞 {s.profiles?.phone || "N/A"}</p>
                                <p>
                                    📅 Joined:{" "}
                                    {new Date(
                                        s.created_at
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Create Staff Account"
            >
                <form onSubmit={handleCreateStaff} className="space-y-4">
                    <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 text-xs text-purple-700 dark:text-purple-300 flex items-start gap-2">
                        <UserPlus size={14} className="mt-0.5 shrink-0" />
                        <span>
                            This creates a new Supabase auth account with role
                            &quot;staff&quot; and a linked staff record. The
                            staff member can log in immediately.
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
                                placeholder="Jane Doe"
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
                                placeholder="staff@hospital.com"
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
                            <option value="general_staff">General Staff</option>
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
                                Position
                            </label>
                            <input
                                type="text"
                                value={form.position}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        position: e.target.value,
                                    })
                                }
                                placeholder="e.g. Receptionist"
                                className={inputClasses}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Shift
                            </label>
                            <select
                                value={form.shift}
                                onChange={(e) =>
                                    setForm({ ...form, shift: e.target.value })
                                }
                                className={inputClasses}
                            >
                                <option value="day">Day</option>
                                <option value="night">Night</option>
                                <option value="rotating">Rotating</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-violet-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />{" "}
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <UserPlus size={16} /> Create Staff Account
                            </>
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
