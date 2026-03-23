"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { LayoutDashboard, Building2, Stethoscope, Users } from "lucide-react";
import type { SidebarLink } from "@/components/Sidebar";
import { createClient } from "@/lib/supabaseClient";

const links: SidebarLink[] = [
    { href: "/dashboard/admin", label: "Analytics", icon: LayoutDashboard },
    { href: "/dashboard/admin/patients", label: "Patients", icon: Users },
    { href: "/dashboard/admin/departments", label: "Departments", icon: Building2 },
    { href: "/dashboard/admin/doctors", label: "Doctors", icon: Stethoscope },
    { href: "/dashboard/admin/staff", label: "Staff", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [userName, setUserName] = useState("");
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUserName(data.user?.user_metadata?.full_name || "Admin");
        });
    }, []);

    return (
        <DashboardLayout links={links} role="admin" roleColor="#ef4444" userName={userName}>
            {children}
        </DashboardLayout>
    );
}
