"use client";

import { useEffect, useState, useMemo } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ShieldCheck, UserPlus, Clock, Activity, Building2, Users } from "lucide-react";
import toast from "react-hot-toast";

interface Appointment {
    id: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    reason: string;
    doctor_id: string | null;
    patients?: {
        id: string;
        user_id: string;
        op_number: string;
        profiles?: { full_name: string };
    };
    doctors?: {
        id: string;
        user_id: string;
        specialization: string;
        profiles?: { full_name: string };
    };
    departments?: { id: string; name: string };
    [key: string]: unknown;
}

interface Doctor {
    id: string;
    user_id: string;
    specialization: string;
    consultation_time: string;
    is_available: boolean;
    is_active: boolean;
    department_id: string | null;
    profiles?: { full_name: string };
    departments?: { name: string };
    [key: string]: unknown;
}

// Generate 30-minute slots from consultation_time string like "10:00 AM - 1:00 PM"
function parseTimeTo24h(timeStr: string): number {
    const cleaned = timeStr.trim().toUpperCase();
    const match = cleaned.match(/^(\d{1,2}):?(\d{2})?\s*(AM|PM)?$/);
    if (!match) return -1;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2] || "0");
    const period = match[3];

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
}

function generateSlots(consultationTime: string): { label: string; value: string }[] {
    if (!consultationTime) return [];

    // Try to parse "HH:MM AM - HH:MM PM" format
    const parts = consultationTime.split(/\s*[-–to]+\s*/i);
    if (parts.length < 2) return [];

    const startMin = parseTimeTo24h(parts[0]);
    const endMin = parseTimeTo24h(parts[1]);

    if (startMin < 0 || endMin < 0 || startMin >= endMin) return [];

    const slots: { label: string; value: string }[] = [];
    for (let m = startMin; m + 30 <= endMin; m += 30) {
        const startH = Math.floor(m / 60);
        const startM = m % 60;
        const endH = Math.floor((m + 30) / 60);
        const endM = (m + 30) % 60;

        const fmt = (h: number, min: number) => {
            const period = h >= 12 ? "PM" : "AM";
            const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
            return `${h12}:${min.toString().padStart(2, "0")} ${period}`;
        };

        const value24 = `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}`;

        slots.push({
            label: `${fmt(startH, startM)} - ${fmt(endH, endM)}`,
            value: value24,
        });
    }
    return slots;
}

export default function StaffAppointments() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<Record<string, string>>({});
    const [selectedSlot, setSelectedSlot] = useState<Record<string, string>>({});

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/staff/appointments");
            const result = await res.json();
            if (res.ok) {
                setAppointments(result.appointments || []);
                setDoctors(result.doctors || []);
            } else {
                toast.error(result.error || "Failed to load appointments");
            }
        } catch {
            toast.error("Failed to load appointments");
        }
        setLoading(false);
    }

    // Get taken slots for a specific doctor on a specific date
    function getTakenSlots(doctorId: string, date: string): Set<string> {
        const taken = new Set<string>();
        for (const apt of appointments) {
            if (
                apt.doctor_id === doctorId &&
                apt.appointment_date === date &&
                apt.appointment_time &&
                apt.appointment_time !== "00:00:00" &&
                !["cancelled"].includes(apt.status)
            ) {
                // Normalize to HH:MM
                taken.add(apt.appointment_time.slice(0, 5));
            }
        }
        return taken;
    }

    // Generate slots for a doctor with availability info
    function getSlotsForDoctor(doctorId: string, date: string) {
        const doctor = doctors.find((d) => d.id === doctorId);
        if (!doctor) return [];

        const allSlots = generateSlots(doctor.consultation_time);
        const takenSlots = getTakenSlots(doctorId, date);

        return allSlots.map((slot) => ({
            ...slot,
            taken: takenSlots.has(slot.value),
        }));
    }

    async function handleVerifyAssign(aptId: string) {
        const docId = selectedDoctor[aptId];
        const slot = selectedSlot[aptId];

        if (!docId) { toast.error("Select a doctor first."); return; }
        if (!slot) { toast.error("Select a time slot."); return; }

        try {
            const res = await fetch("/api/staff/appointments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    appointmentId: aptId,
                    action: "verify_assign",
                    doctorId: docId,
                    appointment_time: slot,
                }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Appointment verified & assigned!");
                setSelectedDoctor((prev) => { const n = { ...prev }; delete n[aptId]; return n; });
                setSelectedSlot((prev) => { const n = { ...prev }; delete n[aptId]; return n; });
                loadData();
            } else {
                toast.error(result.error || "Failed to update");
            }
        } catch {
            toast.error("Failed to update appointment");
        }
    }

    // Keep legacy assign for verified appointments that already have a time
    async function assignAppointment(id: string) {
        const docId = selectedDoctor[id];
        if (!docId) { toast.error("Select a doctor first."); return; }
        try {
            const res = await fetch("/api/staff/appointments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ appointmentId: id, action: "assign", doctorId: docId }),
            });
            const result = await res.json();
            if (res.ok) {
                toast.success("Doctor assigned!");
                loadData();
            } else {
                toast.error(result.error || "Failed to assign");
            }
        } catch {
            toast.error("Failed to assign doctor");
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-foreground">Manage Appointments</h1>

            {appointments.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl border border-glass">
                    <p className="text-muted text-sm">No appointments found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((apt) => {
                        const deptDoctors = doctors.filter(
                            (d) => d.department_id === apt.departments?.id
                        );
                        const chosenDocId = selectedDoctor[apt.id] || "";
                        const slots = chosenDocId
                            ? getSlotsForDoctor(chosenDocId, apt.appointment_date)
                            : [];

                        return (
                            <div key={apt.id} className="flex flex-col p-5 rounded-2xl bg-white dark:bg-[#0f172a] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200 dark:border-slate-800/80 transition-all hover:scale-[1.01] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] mb-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
                                    <div className="flex flex-col gap-1.5 flex-w">
                                        <div className="flex items-center gap-3">
                                            <p className="text-base font-semibold text-foreground">
                                                {apt.reason || "General Consultation"}
                                            </p>
                                            <StatusBadge status={apt.status} />
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted font-medium mt-1">
                                            <div className="flex items-center gap-1.5 text-primary opacity-80 mt-1">
                                                <Clock size={15} />
                                                <span>
                                                    {apt.appointment_date}
                                                    {apt.appointment_time && apt.appointment_time !== "00:00:00" ? (
                                                        <> at {apt.appointment_time}</>
                                                    ) : (
                                                        <span className="ml-1 text-amber-500 dark:text-amber-400">— Awaiting time slot</span>
                                                    )}
                                                </span>
                                            </div>
                                            
                                            {apt.departments?.name && (
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Building2 size={13} className="text-purple-500/80" />
                                                    <span className="text-xs font-semibold tracking-wider uppercase text-muted">{apt.departments.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side Entities */}
                                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                                        {apt.patients?.profiles?.full_name && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-medium text-foreground">{apt.patients.profiles.full_name}</span>
                                                    {apt.patients.op_number && <span className="text-xs uppercase tracking-wider text-teal-600 dark:text-teal-400 font-semibold">{apt.patients.op_number}</span>}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 ml-1">
                                                    <Users size={14} />
                                                </div>
                                            </div>
                                        )}
                                        {apt.doctors?.profiles?.full_name && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-medium text-muted">Dr. {apt.doctors.profiles.full_name}</span>
                                                    <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">{apt.doctors.specialization}</span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500 ml-1">
                                                    <Activity size={14} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pending — select doctor + slot, then verify & assign */}
                                {apt.status === "pending" && (
                                    <div className="space-y-2.5 pt-2 border-t border-glass">
                                        {/* Step 1: Select doctor */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <select
                                                value={chosenDocId}
                                                onChange={(e) => {
                                                    setSelectedDoctor({ ...selectedDoctor, [apt.id]: e.target.value });
                                                    setSelectedSlot({ ...selectedSlot, [apt.id]: "" });
                                                }}
                                                className="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-lg border border-glass glass-panel text-sm text-foreground"
                                            >
                                                <option value="">Select Doctor</option>
                                                {deptDoctors.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.profiles?.full_name || "Unknown"} — {d.specialization || "General"} {d.is_available ? "" : "[Busy]"}
                                                        {d.consultation_time ? ` (🕐 ${d.consultation_time})` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Step 2: Select time slot (only after doctor is chosen) */}
                                        {chosenDocId && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Clock size={14} className="text-muted shrink-0" />
                                                {slots.length === 0 ? (
                                                    <p className="text-xs text-amber-500">No consultation time configured for this doctor.</p>
                                                ) : (
                                                    <select
                                                        value={selectedSlot[apt.id] || ""}
                                                        onChange={(e) => setSelectedSlot({ ...selectedSlot, [apt.id]: e.target.value })}
                                                        className="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-lg border border-glass glass-panel text-sm text-foreground"
                                                    >
                                                        <option value="">Select Time Slot</option>
                                                        {slots.map((slot) => (
                                                            <option
                                                                key={slot.value}
                                                                value={slot.value}
                                                                disabled={slot.taken}
                                                            >
                                                                {slot.label}{slot.taken ? " — ❌ Taken" : " — ✅ Available"}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        )}

                                        {/* Step 3: Verify & Assign button */}
                                        {chosenDocId && selectedSlot[apt.id] && (
                                            <button
                                                onClick={() => handleVerifyAssign(apt.id)}
                                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 shadow-md shadow-blue-500/20 transition-all"
                                            >
                                                <ShieldCheck size={14} /> Verify & Assign
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Verified — assign doctor (legacy, already has time) */}
                                {apt.status === "verified" && (
                                    <div className="flex items-center gap-2 pt-2 border-t border-glass">
                                        <select
                                            value={selectedDoctor[apt.id] || ""}
                                            onChange={(e) => setSelectedDoctor({ ...selectedDoctor, [apt.id]: e.target.value })}
                                            className="px-2 py-1.5 rounded-lg border border-glass glass-panel text-sm text-foreground"
                                        >
                                            <option value="">Select Doctor</option>
                                            {deptDoctors.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.profiles?.full_name || "Unknown"} — {d.specialization || "General"} {d.is_available ? "" : "[Busy]"}
                                                </option>
                                            ))}
                                        </select>
                                        <button onClick={() => assignAppointment(apt.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400 rounded-lg hover:bg-purple-100 transition">
                                            <UserPlus size={14} /> Assign
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
