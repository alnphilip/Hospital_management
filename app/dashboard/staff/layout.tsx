"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { LayoutDashboard, CalendarDays, Stethoscope } from "lucide-react";
import type { SidebarLink } from "@/components/Sidebar";
import { createClient } from "@/lib/supabaseClient";

const links: SidebarLink[] = [
    { href: "/dashboard/staff", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/staff/appointments", label: "Appointments", icon: CalendarDays },
    { href: "/dashboard/staff/doctors", label: "Doctors", icon: Stethoscope },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const [userName, setUserName] = useState("");
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUserName(data.user?.user_metadata?.full_name || "Staff");
        });
    }, []);

    return (
        <DashboardLayout links={links} role="staff" roleColor="#8b5cf6" userName={userName}>
            {children}
        </DashboardLayout>
    );
}
