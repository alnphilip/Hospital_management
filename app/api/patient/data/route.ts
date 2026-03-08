import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAuthUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// GET — fetch patient dashboard data
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        // Verify patient role
        const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "patient") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get patient record
        const { data: patient } = await adminClient
            .from("patients")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!patient) {
            return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        if (type === "overview") {
            const today = new Date().toISOString().split("T")[0];

            const { data: appointments } = await adminClient
                .from("appointments")
                .select("*, doctors:doctor_id(id, user_id, specialization, profiles:user_id(full_name)), departments:department_id(name)")
                .eq("patient_id", patient.id)
                .order("appointment_date", { ascending: true });

            const all = appointments || [];
            const upcoming = all.filter((a) => a.appointment_date >= today && a.status !== "completed" && a.status !== "cancelled");
            const completed = all.filter((a) => a.status === "completed");

            const { count: rxCount } = await adminClient
                .from("prescriptions")
                .select("*", { count: "exact", head: true })
                .eq("patient_id", patient.id);

            return NextResponse.json({
                patientId: patient.id,
                stats: {
                    total: all.length,
                    upcoming: upcoming.length,
                    completed: completed.length,
                    prescriptions: rxCount || 0,
                },
                upcomingAppointments: upcoming.slice(0, 5),
            });
        }

        if (type === "prescriptions") {
            const { data: prescriptions } = await adminClient
                .from("prescriptions")
                .select("*, doctors:doctor_id(id, user_id, specialization, profiles:user_id(full_name)), appointments:appointment_id(appointment_date)")
                .eq("patient_id", patient.id)
                .order("created_at", { ascending: false });

            return NextResponse.json({
                patientId: patient.id,
                prescriptions: prescriptions || [],
            });
        }

        if (type === "departments") {
            const { data: departments } = await adminClient
                .from("departments")
                .select("*")
                .order("name");

            // Get doctors + their department info
            const { data: doctors } = await adminClient
                .from("doctors")
                .select("*, profiles:user_id(full_name), departments:department_id(name)")
                .eq("is_active", true)
                .order("specialization");

            return NextResponse.json({
                departments: departments || [],
                doctors: doctors || [],
            });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (err) {
        console.error("Patient data GET error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
