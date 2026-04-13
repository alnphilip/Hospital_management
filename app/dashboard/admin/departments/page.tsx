"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    Trash2,
    Loader2,
    Check,
    Search,
    Building2,
    ChevronDown,
    ChevronUp,
    Stethoscope,
    Users,
    UserCircle,
    X,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { TableSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

// Predefined list of standard hospital departments
const PREDEFINED_DEPARTMENTS = [
    { name: "Cardiology", description: "Heart and cardiovascular system care" },
    { name: "Neurology", description: "Brain, spinal cord and nervous system disorders" },
    { name: "Orthopedics", description: "Bones, joints, ligaments, tendons and muscles" },
    { name: "Pediatrics", description: "Medical care for infants, children and adolescents" },
    { name: "Dermatology", description: "Skin, hair and nail conditions" },
    { name: "Ophthalmology", description: "Eye and vision care" },
    { name: "ENT (Otolaryngology)", description: "Ear, nose and throat disorders" },
    { name: "General Surgery", description: "Surgical procedures for a wide range of conditions" },
    { name: "Gynecology & Obstetrics", description: "Women's reproductive health and childbirth" },
    { name: "Urology", description: "Urinary tract and male reproductive system" },
    { name: "Psychiatry", description: "Mental health and behavioral disorders" },
    { name: "Oncology", description: "Cancer diagnosis, treatment and management" },
    { name: "Radiology", description: "Medical imaging and diagnostics" },
    { name: "Pathology", description: "Laboratory analysis and disease diagnosis" },
    { name: "Anesthesiology", description: "Anesthesia and pain management" },
    { name: "Emergency Medicine", description: "Urgent and emergency medical care" },
    { name: "Pulmonology", description: "Lung and respiratory system disorders" },
    { name: "Gastroenterology", description: "Digestive system and gastrointestinal tract" },
    { name: "Nephrology", description: "Kidney care and renal diseases" },
    { name: "Endocrinology", description: "Hormonal and metabolic disorders" },
    { name: "Rheumatology", description: "Autoimmune and inflammatory diseases" },
    { name: "Hematology", description: "Blood disorders and diseases" },
    { name: "Plastic Surgery", description: "Reconstructive and cosmetic surgery" },
    { name: "Physiotherapy", description: "Physical rehabilitation and therapy" },
    { name: "Dentistry", description: "Oral health, teeth and gum care" },
    { name: "General Medicine", description: "Primary healthcare and general diagnosis" },
    { name: "ICU (Intensive Care)", description: "Critical care for seriously ill patients" },
    { name: "Neonatology", description: "Care for newborn infants, especially premature" },
    { name: "Infectious Diseases", description: "Diagnosis and treatment of infections" },
    { name: "Geriatrics", description: "Healthcare for elderly patients" },
];

interface Department {
    id: string;
    name: string;
    description: string;
    created_at: string;
    [key: string]: unknown;
}

interface DoctorInfo {
    id: string;
    specialization: string;
    qualification: string;
    experience_years: number;
    is_available: boolean;
    profiles?: { full_name: string; phone: string };
}

interface StaffInfo {
    id: string;
    position: string;
    shift: string;
    profiles?: { full_name: string; phone: string };
}

export default function AdminDepartments() {
    const [loading, setLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    // Expanded department state
    const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);
    const [deptDoctors, setDeptDoctors] = useState<DoctorInfo[]>([]);
    const [deptStaff, setDeptStaff] = useState<StaffInfo[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const res = await fetch("/api/admin/data?type=departments");
            const result = await res.json();
            if (res.ok) {
                setDepartments(result.departments || []);
            }
        } catch {
            console.error("Failed to load departments");
        }
        setLoading(false);
    }

    async function loadDeptMembers(deptId: string) {
        if (expandedDeptId === deptId) {
            setExpandedDeptId(null);
            return;
        }

        setExpandedDeptId(deptId);
        setLoadingMembers(true);
        setDeptDoctors([]);
        setDeptStaff([]);

        try {
            const res = await fetch(`/api/admin/data?type=dept-members&deptId=${deptId}`);
            const result = await res.json();
            if (res.ok) {
                setDeptDoctors(result.doctors || []);
                setDeptStaff(result.staff || []);
            }
        } catch {
            console.error("Failed to load department members");
        }
        setLoadingMembers(false);
    }

    // Filter out departments that are already added
    const existingNames = new Set(
        departments.map((d) => d.name.toLowerCase())
    );
    const availableDepartments = PREDEFINED_DEPARTMENTS.filter(
        (d) => !existingNames.has(d.name.toLowerCase())
    );

    // Apply search filter
    const filteredDepartments = availableDepartments.filter(
        (d) =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function toggleSelect(name: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    }

    function selectAll() {
        if (selected.size === filteredDepartments.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filteredDepartments.map((d) => d.name)));
        }
    }

    async function handleAddSelected(e: React.FormEvent) {
        e.preventDefault();
        if (selected.size === 0) {
            toast.error("Please select at least one department.");
            return;
        }

        setSubmitting(true);

        const toInsert = PREDEFINED_DEPARTMENTS.filter((d) =>
            selected.has(d.name)
        ).map((d) => ({
            name: d.name,
            description: d.description,
        }));

        try {
            const res = await fetch("/api/admin/data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ table: "departments", records: toInsert }),
            });

            if (!res.ok) {
                const result = await res.json();
                toast.error(result.error || "Failed to add departments");
            } else {
                toast.success(
                    `${toInsert.length} department${toInsert.length > 1 ? "s" : ""} added!`
                );
                setShowModal(false);
                setSelected(new Set());
                setSearchQuery("");
                loadData();
            }
        } catch {
            toast.error("Failed to add departments");
        }
        setSubmitting(false);
    }

    async function handleDelete(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!confirm("Delete this department? Doctors and staff in this department will be unassigned.")) return;
        try {
            const res = await fetch(`/api/admin/data?table=departments&id=${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Deleted!");
                if (expandedDeptId === id) setExpandedDeptId(null);
                loadData();
            } else {
                const result = await res.json();
                toast.error(result.error || "Failed to delete");
            }
        } catch {
            toast.error("Failed to delete department");
        }
    }

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-bold text-foreground">
                    Departments
                </h1>
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Departments
                    </h1>
                    <p className="text-sm text-muted mt-1">
                        {departments.length} department
                        {departments.length !== 1 ? "s" : ""} active
                        {" · "}Click to view assigned doctors &amp; staff
                    </p>
                </div>
                <button
                    onClick={() => {
                        setSelected(new Set());
                        setSearchQuery("");
                        setShowModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-xl hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25 transition-all self-start sm:self-auto"
                >
                    <Plus size={16} /> Add Departments
                </button>
            </div>

            {/* Empty state */}
            {departments.length === 0 ? (
                <div className="text-center py-16 glass rounded-2xl border border-glass">
                    <Building2
                        size={40}
                        className="mx-auto text-slate-300 dark:text-muted mb-3"
                    />
                    <p className="text-muted text-sm">
                        No departments yet. Click &quot;Add Departments&quot; to
                        get started.
                    </p>
                </div>
            ) : (
                /* Department cards */
                <div className="space-y-3">
                    {departments.map((dept) => {
                        const isExpanded = expandedDeptId === dept.id;
                        return (
                            <div
                                key={dept.id}
                                className={`glass rounded-2xl border transition-all duration-300 ${isExpanded
                                    ? "border-violet-300 dark:border-violet-700 shadow-lg shadow-violet-500/5"
                                    : "border-glass hover:shadow-md"
                                    }`}
                            >
                                {/* Department header — clickable */}
                                <button
                                    onClick={() => loadDeptMembers(dept.id)}
                                    className="w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left"
                                >
                                    {/* Icon */}
                                    <div
                                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isExpanded
                                            ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                                            : "bg-gradient-to-br from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 text-violet-600 dark:text-violet-400"
                                            }`}
                                    >
                                        <Building2 size={18} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                                            {dept.name}
                                        </h3>
                                        <p className="text-xs text-muted mt-0.5 truncate">
                                            {dept.description || "No description"}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div
                                            onClick={(e) => handleDelete(dept.id, e)}
                                            className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <Trash2 size={15} />
                                        </div>
                                        <div
                                            className={`p-1 rounded-lg transition-transform duration-200 ${isExpanded ? "text-violet-600 dark:text-violet-400" : "text-muted"
                                                }`}
                                        >
                                            {isExpanded ? (
                                                <ChevronUp size={18} />
                                            ) : (
                                                <ChevronDown size={18} />
                                            )}
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded content — Doctors & Staff */}
                                {isExpanded && (
                                    <div className="border-t border-glass px-4 sm:px-5 pb-5 animate-fade-in">
                                        {loadingMembers ? (
                                            <div className="flex items-center justify-center py-8 gap-2 text-muted">
                                                <Loader2 size={18} className="animate-spin" />
                                                <span className="text-sm">Loading members...</span>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
                                                {/* Doctors column */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Stethoscope size={15} className="text-teal-500" />
                                                        <h4 className="text-sm font-semibold text-foreground">
                                                            Doctors
                                                        </h4>
                                                        <span className="text-xs bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full font-medium">
                                                            {deptDoctors.length}
                                                        </span>
                                                    </div>

                                                    {deptDoctors.length === 0 ? (
                                                        <div className="text-center py-6 glass-panel rounded-xl border border-dashed border-glass">
                                                            <UserCircle size={24} className="mx-auto text-slate-300 dark:text-muted mb-1" />
                                                            <p className="text-xs text-muted">
                                                                No doctors assigned
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {deptDoctors.map((doc) => (
                                                                <div
                                                                    key={doc.id}
                                                                    className="flex items-center gap-3 p-3 glass-panel rounded-xl border border-glass"
                                                                >
                                                                    <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-xs shrink-0">
                                                                        {doc.profiles?.full_name?.charAt(0)?.toUpperCase() || "D"}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-foreground truncate">
                                                                            {doc.profiles?.full_name || "Unknown"}
                                                                        </p>
                                                                        <p className="text-xs text-muted truncate">
                                                                            {doc.specialization || "General"} · {doc.qualification || "N/A"} · {doc.experience_years}yr
                                                                        </p>
                                                                    </div>
                                                                    <span
                                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${doc.is_available
                                                                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                                            : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                                                                            }`}
                                                                    >
                                                                        {doc.is_available ? "Available" : "Unavailable"}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Staff column */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Users size={15} className="text-purple-500" />
                                                        <h4 className="text-sm font-semibold text-foreground">
                                                            Office Staff
                                                        </h4>
                                                        <span className="text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
                                                            {deptStaff.length}
                                                        </span>
                                                    </div>

                                                    {deptStaff.length === 0 ? (
                                                        <div className="text-center py-6 glass-panel rounded-xl border border-dashed border-glass">
                                                            <UserCircle size={24} className="mx-auto text-slate-300 dark:text-muted mb-1" />
                                                            <p className="text-xs text-muted">
                                                                No staff assigned
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {deptStaff.map((s) => (
                                                                <div
                                                                    key={s.id}
                                                                    className="flex items-center gap-3 p-3 glass-panel rounded-xl border border-glass"
                                                                >
                                                                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs shrink-0">
                                                                        {s.profiles?.full_name?.charAt(0)?.toUpperCase() || "S"}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-foreground truncate">
                                                                            {s.profiles?.full_name || "Unknown"}
                                                                        </p>
                                                                        <p className="text-xs text-muted truncate">
                                                                            {s.position || "Staff"} · {s.shift?.charAt(0).toUpperCase()}{s.shift?.slice(1)} shift
                                                                        </p>
                                                                    </div>
                                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold glass-panel text-muted shrink-0">
                                                                        📞 {s.profiles?.phone || "N/A"}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Departments Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Add Departments"
                size="lg"
            >
                <form onSubmit={handleAddSelected} className="space-y-4">
                    {/* Info banner */}
                    <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-3 text-xs text-violet-700 dark:text-violet-300 flex items-start gap-2">
                        <Building2 size={14} className="mt-0.5 shrink-0" />
                        <span>
                            Select the departments you want to add to your
                            hospital. Only departments not already added are
                            shown below.
                        </span>
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search departments..."
                            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-glass glass-panel text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-muted"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Select all toggle */}
                    {filteredDepartments.length > 0 && (
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted">
                                {selected.size} of {filteredDepartments.length}{" "}
                                selected
                            </p>
                            <button
                                type="button"
                                onClick={selectAll}
                                className="text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            >
                                {selected.size === filteredDepartments.length
                                    ? "Deselect All"
                                    : "Select All"}
                            </button>
                        </div>
                    )}

                    {/* Department list */}
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {filteredDepartments.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-muted text-sm">
                                    {availableDepartments.length === 0
                                        ? "All departments have already been added! 🎉"
                                        : "No departments match your search."}
                                </p>
                            </div>
                        ) : (
                            filteredDepartments.map((dept) => {
                                const isSelected = selected.has(dept.name);
                                return (
                                    <button
                                        type="button"
                                        key={dept.name}
                                        onClick={() =>
                                            toggleSelect(dept.name)
                                        }
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isSelected
                                            ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/30 shadow-sm"
                                            : "border-glass glass hover:border-slate-300 dark:hover:border-slate-600"
                                            }`}
                                    >
                                        {/* Checkbox */}
                                        <div
                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected
                                                ? "bg-gradient-to-r from-red-500 to-rose-500 border-red-500"
                                                : "border-slate-300 dark:border-slate-600"
                                                }`}
                                        >
                                            {isSelected && (
                                                <Check
                                                    size={12}
                                                    className="text-white"
                                                />
                                            )}
                                        </div>

                                        {/* Department info */}
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className={`text-sm font-medium ${isSelected
                                                    ? "text-red-700 dark:text-red-300"
                                                    : "text-foreground"
                                                    }`}
                                            >
                                                {dept.name}
                                            </p>
                                            <p className="text-xs text-muted truncate">
                                                {dept.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={submitting || selected.size === 0}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />{" "}
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus size={16} /> Add {selected.size}{" "}
                                Department{selected.size !== 1 ? "s" : ""}
                            </>
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
