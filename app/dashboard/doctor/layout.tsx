"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { CalendarDays } from "lucide-react";
import type { SidebarLink } from "@/components/Sidebar";
import { createClient } from "@/lib/supabaseClient";

const links: SidebarLink[] = [
    { href: "/dashboard/doctor", label: "Appointments", icon: CalendarDays },
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
