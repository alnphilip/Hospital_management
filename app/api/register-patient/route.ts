import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            full_name,
            phone,
            date_of_birth,
            gender,
            blood_group,
            address,
            emergency_contact,
        } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId" },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();

        // Update profiles row with full_name and phone if provided
        const profileUpdate: Record<string, string> = {};
        if (full_name) profileUpdate.full_name = full_name;
        if (phone) profileUpdate.phone = phone;
        if (Object.keys(profileUpdate).length > 0) {
            await adminClient
                .from("profiles")
                .update(profileUpdate)
                .eq("id", userId);
        }

        // Build the patient data (only include non-empty fields)
        const patientData: Record<string, string | null> = {};
        if (date_of_birth) patientData.date_of_birth = date_of_birth;
        if (gender) patientData.gender = gender;
        if (blood_group) patientData.blood_group = blood_group;
        if (address) patientData.address = address;
        if (emergency_contact) patientData.emergency_contact = emergency_contact;

        // Check if patients row already exists
        const { data: existing } = await adminClient
            .from("patients")
            .select("id")
            .eq("user_id", userId)
            .single();

        if (existing) {
            // Update existing record with any provided fields
            if (Object.keys(patientData).length > 0) {
                const { error: updateError } = await adminClient
                    .from("patients")
                    .update(patientData)
                    .eq("user_id", userId);

                if (updateError) {
                    console.error("Patient record update error:", updateError);
                    return NextResponse.json(
                        { error: updateError.message },
                        { status: 400 }
                    );
                }
            }
            return NextResponse.json(
                { message: "Patient record updated", patientId: existing.id },
                { status: 200 }
            );
        }

        // Insert new patients row (bypasses RLS via service role)
        const { data: newPatient, error: patientError } = await adminClient
            .from("patients")
            .insert({
                user_id: userId,
                date_of_birth: date_of_birth || null,
                gender: gender || null,
                blood_group: blood_group || "",
                address: address || "",
                emergency_contact: emergency_contact || "",
            })
            .select("id")
            .single();

        if (patientError) {
            console.error("Patient record insert error:", patientError);
            return NextResponse.json(
                { error: patientError.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Patient record created", patientId: newPatient?.id },
            { status: 201 }
        );
    } catch (err) {
        console.error("Register patient error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
