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
import { createClient } from "@/lib/supabaseClient";
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
        const { data, error } = await signUp(email, password, fullName);

        if (error) {
            toast.error(error.message);
            setLoading(false);
            return;
        }

        // Create the patients record
        if (data?.user) {
            const supabase = createClient();

            if (phone) {
                await supabase
                    .from("profiles")
                    .update({ phone })
                    .eq("id", data.user.id);
            }

            const { error: patientError } = await supabase
                .from("patients")
                .insert({
                    user_id: data.user.id,
                    date_of_birth: dateOfBirth || null,
                    gender: gender || null,
                    blood_group: bloodGroup,
                    address: address,
                    emergency_contact: emergencyContact,
                });

            if (patientError) {
                console.error("Patient record error:", patientError);
                toast.error(
                    "Account created but patient profile failed. You can update it later."
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50 to-teal-50 dark:from-slate-950 dark:via-sky-950/30 dark:to-teal-950/20 px-4 py-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                        <Activity className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                        SmartHospital
                    </span>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Patient Registration
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Create your patient account to book appointments
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <User
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Smith"
                                    required
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Phone
                            </label>
                            <div className="relative">
                                <Phone
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className={inputClasses}
                                />
                            </div>
                        </div>

                        {/* Patient Profile Details */}
                        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                                <Heart size={14} />
                                Patient Profile Details
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Date of Birth
                                    </label>
                                    <div className="relative">
                                        <Calendar
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                        />
                                        <input
                                            type="date"
                                            value={dateOfBirth}
                                            onChange={(e) =>
                                                setDateOfBirth(e.target.value)
                                            }
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Gender
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) =>
                                            setGender(e.target.value)
                                        }
                                        className={simpleInputClasses}
                                    >
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Blood Group
                                    </label>
                                    <div className="relative">
                                        <Droplets
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            type="text"
                                            value={bloodGroup}
                                            onChange={(e) =>
                                                setBloodGroup(e.target.value)
                                            }
                                            placeholder="e.g. O+"
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Emergency Contact
                                    </label>
                                    <div className="relative">
                                        <AlertTriangle
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            type="text"
                                            value={emergencyContact}
                                            onChange={(e) =>
                                                setEmergencyContact(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="+91 98765 43210"
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Address
                                </label>
                                <div className="relative">
                                    <MapPin
                                        size={16}
                                        className="absolute left-3 top-3 text-slate-400"
                                    />
                                    <textarea
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                        placeholder="Enter your address"
                                        rows={2}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                    Creating account...
                                </>
                            ) : (
                                "Create Patient Account"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
