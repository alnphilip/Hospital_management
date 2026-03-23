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

// GET — list appointments (filtered by staff's department)
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        // Verify the user is staff or admin
        const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || !["staff", "admin"].includes(profile.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get staff's department (null = general staff → sees all)
        let staffDepartmentId: string | null = null;

        if (profile.role === "staff") {
            const { data: staffRecord } = await adminClient
                .from("staff")
                .select("department_id")
                .eq("user_id", user.id)
                .single();

            staffDepartmentId = staffRecord?.department_id || null;
        }
        // Admin always sees everything (staffDepartmentId stays null)

        // Build appointments query
        let appointmentsQuery = adminClient
            .from("appointments")
            .select("*, patients(id, user_id, op_number, profiles:user_id(full_name)), doctors:doctor_id(id, user_id, specialization, profiles:user_id(full_name)), departments:department_id(id, name)")
            .order("created_at", { ascending: false });

        // Filter by department if staff has a specific department
        if (staffDepartmentId) {
            appointmentsQuery = appointmentsQuery.eq("department_id", staffDepartmentId);
        }

        const { data: appointments } = await appointmentsQuery;

        // Build doctors query
        let doctorsQuery = adminClient
            .from("doctors")
            .select("*, profiles:user_id(full_name), departments:department_id(name)");

        // Filter doctors by department too
        if (staffDepartmentId) {
            doctorsQuery = doctorsQuery.eq("department_id", staffDepartmentId);
        }

        const { data: doctors } = await doctorsQuery;

        return NextResponse.json({
            appointments: appointments || [],
            doctors: doctors || [],
            staffDepartmentId,
        });
    } catch (err) {
        console.error("Staff appointments GET error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH — verify or assign appointment
export async function PATCH(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        // Verify the user is staff or admin
        const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || !["staff", "admin"].includes(profile.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Check staff's department for authorization
        if (profile.role === "staff") {
            const { data: staffRecord } = await adminClient
                .from("staff")
                .select("department_id")
                .eq("user_id", user.id)
                .single();

            const staffDeptId = staffRecord?.department_id || null;

            // If staff has a department, verify the appointment belongs to their department
            if (staffDeptId) {
                const body = await request.clone().json();
                const { data: apt } = await adminClient
                    .from("appointments")
                    .select("department_id")
                    .eq("id", body.appointmentId)
                    .single();

                if (apt && apt.department_id !== staffDeptId) {
                    return NextResponse.json(
                        { error: "You can only manage appointments in your department" },
                        { status: 403 }
                    );
                }
            }
        }

        const body = await request.json();
        const { appointmentId, action, doctorId, appointment_time } = body;

        if (!appointmentId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let updateData: Record<string, string> = {};

        if (action === "verify") {
            updateData = { status: "verified" };
            if (appointment_time) {
                updateData.appointment_time = appointment_time;
            }
        } else if (action === "assign" && doctorId) {
            updateData = { status: "assigned", doctor_id: doctorId };
        } else if (action === "verify_assign" && doctorId && appointment_time) {
            updateData = { status: "assigned", doctor_id: doctorId, appointment_time };
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const { error } = await adminClient
            .from("appointments")
            .update(updateData)
            .eq("id", appointmentId);

        if (error) {
            console.error("Appointment update error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: `Appointment ${action}d successfully` });
    } catch (err) {
        console.error("Staff appointments PATCH error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
