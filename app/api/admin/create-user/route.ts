import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
    try {
        // Verify the requesting user is an admin
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || profile.role !== "admin") {
            return NextResponse.json(
                { error: "Forbidden: Admin access required" },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { email, password, full_name, phone, role, extra } = body;

        if (!email || !password || !full_name || !role) {
            return NextResponse.json(
                { error: "Missing required fields: email, password, full_name, role" },
                { status: 400 }
            );
        }

        if (!["doctor", "staff"].includes(role)) {
            return NextResponse.json(
                { error: "Admin can only create doctor or staff accounts" },
                { status: 400 }
            );
        }

        // Use the admin client to create the user (bypasses email confirmation)
        const adminClient = createAdminClient();

        const { data: newUser, error: createError } =
            await adminClient.auth.admin.createUser({
                email,
                password,
                email_confirm: true, // auto-confirm email
                user_metadata: {
                    full_name,
                    role,
                    phone: phone || "",
                },
            });

        if (createError) {
            return NextResponse.json(
                { error: createError.message },
                { status: 400 }
            );
        }

        if (!newUser.user) {
            return NextResponse.json(
                { error: "User creation failed" },
                { status: 500 }
            );
        }

        // The trigger will auto-create the profiles row.
        // Now create the role-specific table row.
        const userId = newUser.user.id;

        if (role === "doctor") {
            const { error: doctorError } = await adminClient
                .from("doctors")
                .insert({
                    user_id: userId,
                    department_id: extra?.department_id || null,
                    specialization: extra?.specialization || "",
                    qualification: extra?.qualification || "",
                    experience_years: extra?.experience_years || 0,
                });

            if (doctorError) {
                console.error("Doctor record insert error:", doctorError);
                return NextResponse.json(
                    {
                        error: `User created but doctor record failed: ${doctorError.message}`,
                        userId,
                    },
                    { status: 207 }
                );
            }
        }

        if (role === "staff") {
            const { error: staffError } = await adminClient
                .from("staff")
                .insert({
                    user_id: userId,
                    department_id: extra?.department_id || null,
                    position: extra?.position || "",
                    shift: extra?.shift || "day",
                });

            if (staffError) {
                console.error("Staff record insert error:", staffError);
                return NextResponse.json(
                    {
                        error: `User created but staff record failed: ${staffError.message}`,
                        userId,
                    },
                    { status: 207 }
                );
            }
        }

        return NextResponse.json(
            {
                message: `${role} account created successfully`,
                userId,
            },
            { status: 201 }
        );
    } catch (err) {
        console.error("Admin create-user error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
