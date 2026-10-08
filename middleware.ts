import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: cookiesToSet => cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response = NextResponse.next({ request });
          response.cookies.set(name, value, options);
        }),
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (path.startsWith("/auth/callback")) return response;

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("id,role_id,roles(name)")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const role = Array.isArray(appUser?.roles)
    ? appUser?.roles[0]?.name
    : (appUser?.roles as { name?: string } | null)?.name;

  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/worker", request.url));
  }

  if (path.startsWith("/worker") && role !== "WORKER") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = { matcher: ["/worker/:path*", "/admin/:path*", "/auth/callback"] };
