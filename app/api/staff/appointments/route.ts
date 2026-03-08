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

// GET — list all appointments (for staff)
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

        // Get all appointments with patient info, doctor info, department info
        const { data: appointments } = await adminClient
            .from("appointments")
            .select("*, patients(id, user_id, profiles:user_id(full_name)), doctors:doctor_id(id, user_id, specialization, profiles:user_id(full_name)), departments:department_id(id, name)")
            .order("created_at", { ascending: false });

        // Get ALL doctors with their names and departments (show availability status)
        const { data: doctors } = await adminClient
            .from("doctors")
            .select("*, profiles:user_id(full_name), departments:department_id(name)")
            .eq("is_active", true);

        return NextResponse.json({
            appointments: appointments || [],
            doctors: doctors || [],
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

        const body = await request.json();
        const { appointmentId, action, doctorId } = body;

        if (!appointmentId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        let updateData: Record<string, string> = {};

        if (action === "verify") {
            updateData = { status: "verified" };
        } else if (action === "assign" && doctorId) {
            updateData = { status: "assigned", doctor_id: doctorId };
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
