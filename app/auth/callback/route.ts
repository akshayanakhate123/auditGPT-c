import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const supabase = await createClient();

  // OAuth / magic-link flow (PKCE): ?code=xxx
  const code = searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Password reset — redirect to the reset page so user can set a new password
      const next = searchParams.get("next");
      if (next === "/auth/reset-password") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Email OTP confirmation flow: ?token_hash=xxx&type=signup
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "signup" | "recovery" | null;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }
      return NextResponse.redirect(`${origin}/auth/confirmed`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_error`);
}
