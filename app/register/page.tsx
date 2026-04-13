"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Activity,
    Mail,
    Lock,
    User,
    Loader2,
    Heart,
    Phone,
    MapPin,
    Calendar,
    Droplets,
    AlertTriangle,
} from "lucide-react";
import { signUp, getRolePath } from "@/lib/auth";
import { Component as InfiniteGrid } from "@/components/ui/the-infinite-grid";
import toast from "react-hot-toast";

export default function RegisterPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    // Patient profile fields
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [address, setAddress] = useState("");
    const [emergencyContact, setEmergencyContact] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Always register as patient
        const { data, error } = await signUp(email, password, fullName, phone);

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        // Create the patients record via server API (bypasses RLS)
        if (data?.user) {
            try {
                const res = await fetch("/api/register-patient", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: data.user.id,
                        full_name: fullName,
                        phone,
                        date_of_birth: dateOfBirth,
                        gender,
                        blood_group: bloodGroup,
                        address,
                        emergency_contact: emergencyContact,
                    }),
                });

                const result = await res.json();
                if (!res.ok) {
                    console.error("Patient record error:", result.error);
                    toast.error(
                        "Account created but patient profile failed. You can update it in your profile."
                    );
                }
            } catch {
                toast.error(
                    "Account created but patient profile failed. You can update it in your profile."
                );
            }
        }

        toast.success("Account created! Redirecting...");
        router.push(getRolePath("patient"));
    };

    const inputClasses =
        "w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm";

    const simpleInputClasses =
        "w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm";

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden px-4 py-12">
            {/* Background Shader */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-100">
                <InfiniteGrid />
            </div>
            {/* Ambient Background Glows */}
            <div className="absolute top-[-5%] right-[-10%] w-[60%] h-[60%] bg-sky-300/40 dark:bg-sky-600/30 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-teal-300/40 dark:bg-teal-600/30 blur-[130px] rounded-full pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-10 animate-fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                        <Activity className="text-white" size={24} strokeWidth={2.5} />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-foreground">
                        SmartHospital
                    </span>
                </div>

                {/* Card */}
                <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-fade-in">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-foreground tracking-tight">
                            Patient Registration
                        </h1>
                        <p className="text-muted font-semibold mt-2">
                            Join our modern healthcare network
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/80 ml-1">
                                    Full Name
                                </label>
                                <div className="relative group">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="John Smith"
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/80 ml-1">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/80 ml-1">
                                    Phone Number
                                </label>
                                <div className="relative group">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-foreground/80 ml-1">
                                    Security Password
                                </label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Patient Profile Details */}
                        <div className="pt-8 border-t border-white/10">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Heart size={16} className="text-primary" />
                                </div>
                                <h3 className="text-lg font-black text-foreground tracking-tight">Clinical Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground/80 ml-1">
                                        Date of Birth
                                    </label>
                                    <div className="relative group">
                                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors pointer-events-none" />
                                        <input
                                            type="date"
                                            value={dateOfBirth}
                                            onChange={(e) => setDateOfBirth(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground/80 ml-1">
                                        Biological Gender
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full px-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground/80 ml-1">
                                        Blood Group
                                    </label>
                                    <div className="relative group">
                                        <Droplets size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            value={bloodGroup}
                                            onChange={(e) => setBloodGroup(e.target.value)}
                                            placeholder="e.g. O+"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground/80 ml-1">
                                        Emergency Contact
                                    </label>
                                    <div className="relative group">
                                        <AlertTriangle size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            value={emergencyContact}
                                            onChange={(e) => setEmergencyContact(e.target.value)}
                                            placeholder="+91 98765 43210"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-foreground/80 ml-1">
                                        Residential Address
                                    </label>
                                    <div className="relative group">
                                        <MapPin size={18} className="absolute left-4 top-4 text-muted group-focus-within:text-primary transition-colors" />
                                        <textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Complete street address, city, state"
                                            rows={2}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 dark:bg-black/20 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:scale-[1.01] shadow-xl shadow-sky-600/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Creating Record...
                                </>
                            ) : (
                                "Complete Registration"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm font-bold text-muted mt-10">
                    Already have a medical account?{" "}
                    <Link
                        href="/login"
                        className="text-primary hover:underline ml-1"
                    >
                        Sign in instead
                    </Link>
                </p>
            </div>
        </div>
    );
}
