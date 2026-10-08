import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = "https://pcgh-taskforge.vercel.app";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, SITE_URL));
    }
  }

  return NextResponse.redirect(new URL("/worker", SITE_URL));
}