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

// GET — fetch the logged-in patient's own profile + patient data
export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        // Verify the user is a patient
        const { data: profile } = await adminClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "patient") {
            return NextResponse.json({ error: "Forbidden: Patient access only" }, { status: 403 });
        }

        // Fetch patient-specific data
        let { data: patient } = await adminClient
            .from("patients")
            .select("*")
            .eq("user_id", user.id)
            .single();

        // Auto-create patients row if missing
        if (!patient) {
            const { data: newPatient } = await adminClient
                .from("patients")
                .insert({ user_id: user.id })
                .select("*")
                .single();
            patient = newPatient;
        }

        return NextResponse.json({
            profile: {
                full_name: profile.full_name || "",
                email: user.email || "",
                phone: profile.phone || "",
                date_of_birth: patient?.date_of_birth || "",
                gender: patient?.gender || "",
                blood_group: patient?.blood_group || "",
                address: patient?.address || "",
                emergency_contact: patient?.emergency_contact || "",
            },
        });
    } catch (err) {
        console.error("Patient profile GET error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH — update the logged-in patient's own profile
export async function PATCH(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        // Verify the user is a patient
        const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "patient") {
            return NextResponse.json({ error: "Forbidden: Patient access only" }, { status: 403 });
        }

        const body = await request.json();
        const { full_name, phone, date_of_birth, gender, blood_group, address, emergency_contact } = body;

        // Update profiles table (name, phone)
        const profileUpdate: Record<string, string> = {};
        if (full_name !== undefined) profileUpdate.full_name = full_name;
        if (phone !== undefined) profileUpdate.phone = phone;
        if (Object.keys(profileUpdate).length > 0) {
            const { error: profError } = await adminClient
                .from("profiles")
                .update(profileUpdate)
                .eq("id", user.id);
            if (profError) {
                return NextResponse.json({ error: profError.message }, { status: 400 });
            }
        }

        // Update patients table (medical info)
        const patientUpdate: Record<string, string | null> = {};
        if (date_of_birth !== undefined) patientUpdate.date_of_birth = date_of_birth || null;
        if (gender !== undefined) patientUpdate.gender = gender || null;
        if (blood_group !== undefined) patientUpdate.blood_group = blood_group;
        if (address !== undefined) patientUpdate.address = address;
        if (emergency_contact !== undefined) patientUpdate.emergency_contact = emergency_contact;

        if (Object.keys(patientUpdate).length > 0) {
            // Ensure patient record exists
            const { data: existing } = await adminClient
                .from("patients")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (existing) {
                const { error: patError } = await adminClient
                    .from("patients")
                    .update(patientUpdate)
                    .eq("user_id", user.id);
                if (patError) {
                    return NextResponse.json({ error: patError.message }, { status: 400 });
                }
            } else {
                const { error: insError } = await adminClient
                    .from("patients")
                    .insert({ user_id: user.id, ...patientUpdate });
                if (insError) {
                    return NextResponse.json({ error: insError.message }, { status: 400 });
                }
            }
        }

        return NextResponse.json({ message: "Profile updated successfully" });
    } catch (err) {
        console.error("Patient profile PATCH error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
