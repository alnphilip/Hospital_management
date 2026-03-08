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

// GET — fetch admin dashboard data (doctors, staff, departments, appointments)
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        // Verify admin role
        const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type");

        if (type === "doctors") {
            const { data: doctors } = await adminClient
                .from("doctors")
                .select("*, profiles:user_id(full_name, phone), departments:department_id(name)");

            const { data: departments } = await adminClient
                .from("departments")
                .select("id, name")
                .order("name");

            return NextResponse.json({ doctors: doctors || [], departments: departments || [] });
        }

        if (type === "staff") {
            const { data: staff } = await adminClient
                .from("staff")
                .select("*, profiles:user_id(full_name, phone), departments:department_id(name)");

            const { data: departments } = await adminClient
                .from("departments")
                .select("id, name")
                .order("name");

            return NextResponse.json({ staff: staff || [], departments: departments || [] });
        }

        if (type === "departments") {
            const { data: departments } = await adminClient
                .from("departments")
                .select("*")
                .order("name");

            return NextResponse.json({ departments: departments || [] });
        }

        if (type === "overview") {
            const { data: doctors } = await adminClient.from("doctors").select("id");
            const { data: patients } = await adminClient.from("patients").select("id");
            const { data: staff } = await adminClient.from("staff").select("id");
            const { data: departments } = await adminClient.from("departments").select("id");
            const { data: appointments } = await adminClient.from("appointments").select("status");

            return NextResponse.json({
                doctorsCount: doctors?.length || 0,
                patientsCount: patients?.length || 0,
                staffCount: staff?.length || 0,
                departmentsCount: departments?.length || 0,
                appointments: appointments || [],
            });
        }

        if (type === "dept-members") {
            const deptId = searchParams.get("deptId");
            if (!deptId) {
                return NextResponse.json({ error: "Missing deptId" }, { status: 400 });
            }

            const { data: doctors } = await adminClient
                .from("doctors")
                .select("id, specialization, qualification, experience_years, is_available, profiles:user_id(full_name, phone)")
                .eq("department_id", deptId);

            const { data: staff } = await adminClient
                .from("staff")
                .select("id, position, shift, profiles:user_id(full_name, phone)")
                .eq("department_id", deptId);

            return NextResponse.json({ doctors: doctors || [], staff: staff || [] });
        }

        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    } catch (err) {
        console.error("Admin data GET error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH — update a record (doctors, staff, departments)
export async function PATCH(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { table, id, updates } = body;

        if (!table || !id || !updates) {
            return NextResponse.json({ error: "Missing table, id, or updates" }, { status: 400 });
        }

        const allowedTables = ["doctors", "staff", "departments"];
        if (!allowedTables.includes(table)) {
            return NextResponse.json({ error: "Invalid table" }, { status: 400 });
        }

        const { error } = await adminClient
            .from(table)
            .update(updates)
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Updated successfully" });
    } catch (err) {
        console.error("Admin data PATCH error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE — delete a record
export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const table = searchParams.get("table");
        const id = searchParams.get("id");

        if (!table || !id) {
            return NextResponse.json({ error: "Missing table or id" }, { status: 400 });
        }

        const allowedTables = ["doctors", "staff", "departments"];
        if (!allowedTables.includes(table)) {
            return NextResponse.json({ error: "Invalid table" }, { status: 400 });
        }

        const { error } = await adminClient
            .from(table)
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (err) {
        console.error("Admin data DELETE error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST — insert records (departments, etc.)
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminClient = createAdminClient();

        const { data: profile } = await adminClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { table, records } = body;

        if (!table || !records || !Array.isArray(records)) {
            return NextResponse.json({ error: "Missing table or records array" }, { status: 400 });
        }

        const allowedTables = ["departments"];
        if (!allowedTables.includes(table)) {
            return NextResponse.json({ error: "Invalid table" }, { status: 400 });
        }

        const { error } = await adminClient
            .from(table)
            .insert(records);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: `${records.length} record(s) created` }, { status: 201 });
    } catch (err) {
        console.error("Admin data POST error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
