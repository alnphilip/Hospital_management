"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { LayoutDashboard, CalendarDays, Users } from "lucide-react";
import type { SidebarLink } from "@/components/Sidebar";
import { createClient } from "@/lib/supabaseClient";

const links: SidebarLink[] = [
    { href: "/dashboard/doctor", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/doctor/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/dashboard/doctor/patients", label: "My Patients", icon: Users },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUserName(data.user?.user_metadata?.full_name || "Doctor");
        });
    }, []);

    return (
        <DashboardLayout links={links} role="doctor" roleColor="#14b8a6" userName={userName}>
            {children}
        </DashboardLayout>
    );
}
