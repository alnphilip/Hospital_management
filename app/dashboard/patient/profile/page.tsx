"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Pencil, X, User, Phone, Calendar, Heart, Droplets, MapPin, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function PatientProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        blood_group: "",
        address: "",
        emergency_contact: "",
    });
    const [editForm, setEditForm] = useState({ ...profile });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const res = await fetch("/api/patient/profile");
            const result = await res.json();
            if (res.ok && result.profile) {
                setProfile(result.profile);
                setEditForm(result.profile);
            } else {
                toast.error(result.error || "Failed to load profile");
            }
        } catch {
            toast.error("Failed to load profile");
        }
        setLoading(false);
    }

    function startEditing() {
        setEditForm({ ...profile });
        setEditing(true);
    }

    function cancelEditing() {
        setEditForm({ ...profile });
        setEditing(false);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/patient/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: editForm.full_name,
                    phone: editForm.phone,
                    date_of_birth: editForm.date_of_birth,
                    gender: editForm.gender,
                    blood_group: editForm.blood_group,
                    address: editForm.address,
                    emergency_contact: editForm.emergency_contact,
                }),
            });

            if (!res.ok) {
                const result = await res.json();
                toast.error(result.error || "Failed to save profile.");
            } else {
                setProfile({ ...editForm });
                setEditing(false);
                toast.success("Profile updated!");
            }
        } catch {
            toast.error("Failed to save profile.");
        }
        setSaving(false);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-sky-500" size={32} />
            </div>
        );
    }

    const inputClasses =
        "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50";

    // Read-only view
    if (!editing) {
        const fields = [
            { label: "Full Name", value: profile.full_name, icon: User },
            { label: "Email", value: profile.email, icon: User },
            { label: "Phone", value: profile.phone, icon: Phone },
            { label: "Date of Birth", value: profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "", icon: Calendar },
            { label: "Gender", value: profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : "", icon: Heart },
            { label: "Blood Group", value: profile.blood_group, icon: Droplets },
            { label: "Address", value: profile.address, icon: MapPin },
            { label: "Emergency Contact", value: profile.emergency_contact, icon: AlertTriangle },
        ];

        return (
            <div className="max-w-2xl space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                    <button
                        onClick={startEditing}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 shadow-lg shadow-sky-500/25 transition-all"
                    >
                        <Pencil size={14} /> Edit Profile
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    {/* Avatar header */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center text-white font-bold text-2xl">
                            {profile.full_name?.charAt(0)?.toUpperCase() || "P"}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{profile.full_name || "—"}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{profile.email}</p>
                        </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {fields.slice(2).map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center shrink-0">
                                        <Icon size={14} className="text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{f.label}</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {f.value || <span className="text-slate-400 italic font-normal">Not provided</span>}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // Edit mode
    return (
        <div className="max-w-2xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Profile</h1>
                <button
                    onClick={cancelEditing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                    <X size={14} /> Cancel
                </button>
            </div>

            <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                        <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                        <input type="date" value={editForm.date_of_birth} onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                        <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className={inputClasses}>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                        <input type="text" value={editForm.blood_group} onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })} placeholder="e.g. O+" className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emergency Contact</label>
                        <input type="text" value={editForm.emergency_contact} onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })} className={inputClasses} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                    <textarea value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} rows={2} className={`${inputClasses} resize-none`} />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 transition-all disabled:opacity-60"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                </button>
            </form>
        </div>
    );
}
