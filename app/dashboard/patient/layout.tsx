"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    LayoutDashboard,
    CalendarDays,
    FileText,
    UserCircle,
    Building2,
} from "lucide-react";
import type { SidebarLink } from "@/components/Sidebar";
import { createClient } from "@/lib/supabaseClient";

const links: SidebarLink[] = [
    { href: "/dashboard/patient", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/patient/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/dashboard/patient/prescriptions", label: "Prescriptions", icon: FileText },
    { href: "/dashboard/patient/departments", label: "Departments", icon: Building2 },
    { href: "/dashboard/patient/profile", label: "Profile", icon: UserCircle },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUserName(data.user?.user_metadata?.full_name || "Patient");
        });
    }, []);

    return (
        <DashboardLayout
            links={links}
            role="patient"
            roleColor="#0ea5e9"
            userName={userName}
        >
            {children}
        </DashboardLayout>
    );
}
