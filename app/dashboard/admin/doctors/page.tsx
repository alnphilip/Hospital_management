"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Plus, Loader2 } from "lucide-react";
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
    profiles?: { full_name: string };
    departments?: { name: string };
    [key: string]: unknown;
}

interface Department {
    id: string;
    name: string;
    [key: string]: unknown;
}

interface DoctorUser {
    id: string;
    full_name: string;
}

export default function AdminDoctors() {
    const [loading, setLoading] = useState(true);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [doctorUsers, setDoctorUsers] = useState<DoctorUser[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ user_id: "", department_id: "", specialization: "", qualification: "", experience_years: 0 });

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        const supabase = createClient();
        const { data: docs } = await supabase.from("doctors").select("*, profiles(full_name), departments(name)");
        setDoctors(docs || []);
        const { data: depts } = await supabase.from("departments").select("id, name").order("name");
        setDepartments(depts || []);

        // Fetch users with role='doctor' who are not yet linked to a doctor record
        const existingUserIds = (docs || []).map((d: Doctor) => d.user_id).filter(Boolean);
        const { data: availableUsers } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("role", "doctor")
            .not("id", "in", existingUserIds.length > 0 ? `(${existingUserIds.join(",")})` : "(00000000-0000-0000-0000-000000000000)");
        setDoctorUsers(availableUsers || []);

        setLoading(false);
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        const supabase = createClient();
        const { error } = await supabase.from("doctors").insert({
            user_id: form.user_id,
            department_id: form.department_id || null,
            specialization: form.specialization,
            qualification: form.qualification,
            experience_years: form.experience_years,
        });
        if (error) toast.error(error.message);
        else { toast.success("Doctor added!"); setShowModal(false); loadData(); }
        setSubmitting(false);
    }

    async function toggleAvailability(id: string, current: boolean) {
        const supabanase = createClient();
        const { error } = await supabanase.from("doctors").update({ is_available: !current }).eq("id", id);
        if (error) toast.error(error.message);
        else { toast.success("Updated!"); loadData(); }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Doctors</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Doctors</h1>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25 transition-all">
                    <Plus size={16} /> Add Doctor
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                    <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{doc.profiles?.full_name || "Unknown"}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{doc.specialization}</p>
                            </div>
                            <button
                                onClick={() => toggleAvailability(doc.id, doc.is_available)}
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition ${doc.is_available ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"}`}
                            >
                                {doc.is_available ? "Available" : "Unavailable"}
                            </button>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                            <p>🏥 {doc.departments?.name || "No dept"}</p>
                            <p>🎓 {doc.qualification || "N/A"}</p>
                            <p>📅 {doc.experience_years}yr exp</p>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Doctor">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Doctor User</label>
                        <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} required className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50">
                            <option value="">Select a user...</option>
                            {doctorUsers.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.id}</option>)}
                        </select>
                        {doctorUsers.length === 0 && <p className="text-xs text-amber-500 mt-1">No unlinked doctor-role users found. Register a user with role &quot;doctor&quot; first.</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                        <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none">
                            <option value="">None</option>
                            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specialization</label>
                            <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Qualification</label>
                            <input type="text" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience (years)</label>
                        <input type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) || 0 })} min={0} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none" />
                    </div>
                    <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                        {submitting ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : "Add Doctor"}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
