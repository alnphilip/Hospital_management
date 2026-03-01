import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // If accessing a dashboard route without being logged in, redirect to login
    if (pathname.startsWith("/dashboard") && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // If logged in and accessing auth pages, redirect to their dashboard
    if (user && (pathname === "/login" || pathname === "/register")) {
        const role = user.user_metadata?.role || "patient";
        const url = request.nextUrl.clone();
        url.pathname = `/dashboard/${role}`;
        return NextResponse.redirect(url);
    }

    // If logged in and accessing a dashboard, ensure they're on the right role path
    if (user && pathname.startsWith("/dashboard/")) {
        const role = user.user_metadata?.role || "patient";
        const segments = pathname.split("/");
        const dashboardRole = segments[2]; // /dashboard/{role}/...

        if (
            dashboardRole &&
            dashboardRole !== role &&
            ["patient", "doctor", "staff", "admin"].includes(dashboardRole)
        ) {
            const url = request.nextUrl.clone();
            url.pathname = `/dashboard/${role}`;
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};
