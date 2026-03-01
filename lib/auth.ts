import { createClient } from "./supabaseClient";

export type UserRole = "patient" | "doctor" | "staff" | "admin";

const rolePaths: Record<UserRole, string> = {
    patient: "/dashboard/patient",
    doctor: "/dashboard/doctor",
    staff: "/dashboard/staff",
    admin: "/dashboard/admin",
};

export function getRolePath(role: UserRole): string {
    return rolePaths[role] || "/login";
}

export async function signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole
) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role,
            },
        },
    });
    return { data, error };
}

export async function signIn(email: string, password: string) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
}

export async function signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getSession() {
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return session;
}

export async function getUserRole(): Promise<UserRole | null> {
    const session = await getSession();
    if (!session) return null;
    return (session.user.user_metadata?.role as UserRole) || null;
}
