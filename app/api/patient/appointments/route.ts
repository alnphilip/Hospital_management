import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Helper to get the authenticated user from cookies
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

// GET — list patient's appointments
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        // Get patient ID
        const { data: patient } = await adminClient
            .from("patients")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!patient) {
            return NextResponse.json({ appointments: [], patientId: null });
        }

        // Get appointments with doctor and department info
        const { data: appointments } = await adminClient
            .from("appointments")
            .select("*, doctors:doctor_id(id, user_id, specialization, profiles:user_id(full_name)), departments:department_id(id, name)")
            .eq("patient_id", patient.id)
            .order("appointment_date", { ascending: false });

        // Also get departments for booking form
        const { data: departments } = await adminClient
            .from("departments")
            .select("id, name")
            .order("name");

        return NextResponse.json({
            appointments: appointments || [],
            departments: departments || [],
            patientId: patient.id,
        });
    } catch (err) {
        console.error("Get appointments error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST — book a new appointment
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { patientId, department_id, appointment_date, appointment_time, reason } = body;

        if (!patientId || !appointment_date || !appointment_time) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const adminClient = createAdminClient();

        // Verify this patient belongs to the authenticated user
        const { data: patient } = await adminClient
            .from("patients")
            .select("id, user_id")
            .eq("id", patientId)
            .single();

        if (!patient || patient.user_id !== user.id) {
            return NextResponse.json({ error: "Unauthorized patient" }, { status: 403 });
        }

        // Insert appointment
        const { data: appointment, error } = await adminClient
            .from("appointments")
            .insert({
                patient_id: patientId,
                department_id: department_id || null,
                appointment_date,
                appointment_time,
                reason: reason || "",
                status: "pending",
            })
            .select()
            .single();

        if (error) {
            console.error("Appointment insert error:", error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ appointment }, { status: 201 });
    } catch (err) {
        console.error("Book appointment error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
