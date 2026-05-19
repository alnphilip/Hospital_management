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

// GET — fetch doctor dashboard data
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        // Verify doctor role
        const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "doctor") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get doctor record
        const { data: doctor } = await adminClient
            .from("doctors")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!doctor) {
            return NextResponse.json({ error: "Doctor record not found" }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        if (type === "overview") {
            const today = new Date().toISOString().split("T")[0];

            const { data: appointments } = await adminClient
                .from("appointments")
                .select("*, patients:patient_id(id, user_id, profiles:user_id(full_name))")
                .eq("doctor_id", doctor.id)
                .order("appointment_date", { ascending: true });

            const all = appointments || [];
            const todayApts = all.filter((a) => a.appointment_date === today);
            const pending = all.filter((a) => a.status === "assigned");

            const { count: rxCount } = await adminClient
                .from("prescriptions")
                .select("*", { count: "exact", head: true })
                .eq("doctor_id", doctor.id);

            return NextResponse.json({
                doctorId: doctor.id,
                stats: {
                    total: all.length,
                    today: todayApts.length,
                    prescriptions: rxCount || 0,
                    pending: pending.length,
                },
                todayAppointments: todayApts.slice(0, 5),
            });
        }

        if (type === "appointments") {
            const { data: appointments } = await adminClient
                .from("appointments")
                .select("*, patients:patient_id(id, user_id, profiles:user_id(full_name)), departments:department_id(name)")
                .eq("doctor_id", doctor.id)
                .order("appointment_date", { ascending: false });

            // Also fetch prescriptions for these appointments so UI knows which have Rx
            const aptIds = (appointments || []).map((a) => a.id);
            let prescriptionMap: Record<string, { id: string; diagnosis: string; medications: unknown[]; instructions: string; created_at: string }> = {};

            if (aptIds.length > 0) {
                const { data: prescriptions } = await adminClient
                    .from("prescriptions")
                    .select("id, appointment_id, diagnosis, medications, instructions, created_at")
                    .eq("doctor_id", doctor.id)
                    .in("appointment_id", aptIds);

                for (const rx of prescriptions || []) {
                    prescriptionMap[rx.appointment_id] = rx;
                }
            }

            const enriched = (appointments || []).map((apt) => ({
                ...apt,
                prescription: prescriptionMap[apt.id] || null,
            }));

            return NextResponse.json({
                doctorId: doctor.id,
                appointments: enriched,
            });
        }

        if (type === "patients") {
            // Get all appointments for this doctor (with full details for prescription creation)
            const { data: appointments } = await adminClient
                .from("appointments")
                .select("id, patient_id, appointment_date, appointment_time, status, reason")
                .eq("doctor_id", doctor.id)
                .order("appointment_date", { ascending: false });

            if (!appointments || appointments.length === 0) {
                return NextResponse.json({ patients: [] });
            }

            const patientIds = [...new Set(appointments.map((a) => a.patient_id))];

            const { data: patientData } = await adminClient
                .from("patients")
                .select("*, op_number, profiles:user_id(full_name)")
                .in("id", patientIds);

            // Get all prescriptions this doctor wrote for these patients
            const { data: prescriptions } = await adminClient
                .from("prescriptions")
                .select("id, patient_id, appointment_id, diagnosis, medications, instructions, created_at")
                .eq("doctor_id", doctor.id)
                .in("patient_id", patientIds)
                .order("created_at", { ascending: false });

            const enriched = (patientData || []).map((p) => {
                const patientAppts = appointments.filter((a) => a.patient_id === p.id);
                const patientRx = (prescriptions || []).filter((rx) => rx.patient_id === p.id);
                return {
                    ...p,
                    appointment_count: patientAppts.length,
                    last_appointment: patientAppts[0]?.appointment_date || null,
                    appointments: patientAppts,
                    prescriptions: patientRx,
                };
            });

            return NextResponse.json({ patients: enriched });
        }

        if (type === "prescriptions") {
            const { data: prescriptions } = await adminClient
                .from("prescriptions")
                .select("*, patients:patient_id(id, user_id, profiles:user_id(full_name))")
                .eq("doctor_id", doctor.id)
                .order("created_at", { ascending: false });

            // Get assigned appointments for creating new prescriptions
            const { data: assignedApts } = await adminClient
                .from("appointments")
                .select("id, appointment_date, patient_id, patients:patient_id(profiles:user_id(full_name))")
                .eq("doctor_id", doctor.id)
                .in("status", ["assigned", "completed"]);

            return NextResponse.json({
                doctorId: doctor.id,
                prescriptions: prescriptions || [],
                appointments: assignedApts || [],
            });
        }

        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    } catch (err) {
        console.error("Doctor data GET error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH — update appointment status (complete) or create prescription
export async function PATCH(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        const { data: doctor } = await adminClient
            .from("doctors")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!doctor) {
            return NextResponse.json({ error: "Doctor record not found" }, { status: 404 });
        }

        const body = await request.json();
        const { action, appointmentId } = body;

        if (action === "complete" && appointmentId) {
            const { error } = await adminClient
                .from("appointments")
                .update({ status: "completed" })
                .eq("id", appointmentId)
                .eq("doctor_id", doctor.id);

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            return NextResponse.json({ message: "Appointment completed" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err) {
        console.error("Doctor data PATCH error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST — create prescription
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        const { data: doctor } = await adminClient
            .from("doctors")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (!doctor) {
            return NextResponse.json({ error: "Doctor record not found" }, { status: 404 });
        }

        const body = await request.json();
        const { appointment_id, patient_id, diagnosis, medications, instructions } = body;

        if (!appointment_id || !patient_id) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const { error } = await adminClient
            .from("prescriptions")
            .insert({
                appointment_id,
                patient_id,
                doctor_id: doctor.id,
                diagnosis: diagnosis || "",
                medications: medications || [],
                instructions: instructions || "",
            });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Prescription created" }, { status: 201 });
    } catch (err) {
        console.error("Doctor prescription POST error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
