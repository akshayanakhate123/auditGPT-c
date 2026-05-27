import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const RequestSchema = z.object({
  brandName: z.string().min(1),
  brandUrl: z.string().url(),
  category: z.string().min(1),
  meta_ad_url: z.string().url().optional(),
  instagram_handle: z.string().optional(),
  competitor_urls: z.array(z.string().url()).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { brandName, brandUrl, category, meta_ad_url, instagram_handle, competitor_urls } =
    parsed.data;

  const { data: auditRow, error } = await supabase
    .from("audits")
    .insert({
      user_id: user.id,
      brand_name: brandName,
      brand_url: brandUrl,
      category,
      meta_ad_url: meta_ad_url ?? null,
      instagram_handle: instagram_handle ?? null,
      competitor_urls: competitor_urls ?? [],
      status: "processing",
    })
    .select("id")
    .single();

  if (error || !auditRow) {
    return NextResponse.json({ error: "Failed to create audit record" }, { status: 500 });
  }

  return NextResponse.json({ id: auditRow.id });
}
