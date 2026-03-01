"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function PatientProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        full_name: "",
        phone: "",
        date_of_birth: "",
        gender: "",
        blood_group: "",
        address: "",
        emergency_contact: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        const { data: patient } = await supabase
            .from("patients")
            .select("*")
            .eq("user_id", user.id)
            .single();

        setProfile({
            full_name: prof?.full_name || "",
            phone: prof?.phone || "",
            date_of_birth: patient?.date_of_birth || "",
            gender: patient?.gender || "",
            blood_group: patient?.blood_group || "",
            address: patient?.address || "",
            emergency_contact: patient?.emergency_contact || "",
        });
        setLoading(false);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setSaving(false); return; }

        // Update profiles table
        const { error: profError } = await supabase
            .from("profiles")
            .update({ full_name: profile.full_name, phone: profile.phone })
            .eq("id", user.id);

        // Check if patients record exists
        const { data: existingPatient } = await supabase
            .from("patients")
            .select("id")
            .eq("user_id", user.id)
            .single();

        let patError = null;

        const patientData = {
            date_of_birth: profile.date_of_birth || null,
            gender: profile.gender || null,
            blood_group: profile.blood_group,
            address: profile.address,
            emergency_contact: profile.emergency_contact,
        };

        if (existingPatient) {
            // Update existing record
            const { error } = await supabase
                .from("patients")
                .update(patientData)
                .eq("user_id", user.id);
            patError = error;
        } else {
            // Insert new record
            const { error } = await supabase
                .from("patients")
                .insert({ user_id: user.id, ...patientData });
            patError = error;
        }

        if (profError || patError) {
            console.error("Profile error:", profError, "Patient error:", patError);
            toast.error(patError?.message || profError?.message || "Failed to save profile.");
        } else {
            toast.success("Profile updated!");
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

    return (
        <div className="max-w-2xl space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>

            <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input type="text" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                        <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                        <input type="date" value={profile.date_of_birth} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                        <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })} className={inputClasses}>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Blood Group</label>
                        <input type="text" value={profile.blood_group} onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })} placeholder="e.g. O+" className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emergency Contact</label>
                        <input type="text" value={profile.emergency_contact} onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })} className={inputClasses} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                    <textarea value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} rows={2} className={`${inputClasses} resize-none`} />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 transition-all disabled:opacity-60"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Profile
                </button>
            </form>
        </div>
    );
}
