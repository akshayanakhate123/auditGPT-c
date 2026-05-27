import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AuditOutput } from "@/lib/rubric";

function computeBrandHealth(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null);
  if (!valid.length) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: auditId } = await context.params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: audit } = await supabase
    .from("audits")
    .select(
      "id, user_id, brand_name, brand_url, category, meta_ad_url, instagram_handle, competitor_urls, data"
    )
    .eq("id", auditId)
    .eq("user_id", user.id)
    .single();

  if (!audit) return NextResponse.json({ error: "Audit not found" }, { status: 404 });

  type SectionMap = Record<string, Record<string, unknown>>;
  const sections = ((audit.data as Record<string, unknown>)?.sections ?? {}) as SectionMap;

  const websiteSection = sections.website;
  if (!websiteSection?.output) {
    return NextResponse.json({ error: "Website section not complete" }, { status: 400 });
  }

  const base = websiteSection.output as AuditOutput;
  const metaSection = sections.meta as
    | { creative?: AuditOutput["creative"]; data_source?: string }
    | undefined;
  const igSection = sections.instagram as
    | { social?: AuditOutput["social"]; data_source?: string }
    | undefined;

  const creative = metaSection?.creative ?? base.creative;
  const social = igSection?.social ?? base.social;

  const websiteSources = (websiteSection.data_sources ?? {}) as Record<string, string>;
  const data_sources = {
    pdp_health: websiteSources.pdp_health ?? "NO_DATA",
    creative: metaSection?.data_source ?? "NO_DATA",
    social: igSection?.data_source ?? "NO_DATA",
    funnel: websiteSources.funnel ?? "NO_DATA",
    retention: websiteSources.retention ?? "NO_DATA",
    seo: websiteSources.seo ?? "NO_DATA",
  };

  const raw_contexts = {
    website: (websiteSection as any).raw_context ?? null,
    meta: (metaSection as any)?.raw_context ?? null,
    instagram: (igSection as any)?.raw_context ?? null,
  };

  const brandHealthScore = computeBrandHealth([
    base.pdp.score,
    creative.score,
    social.score,
    base.funnel.score,
    base.retention.score,
    base.seo.score,
  ]);

  const finalData = {
    ...base,
    creative,
    social,
    brandHealthScore,
    id: auditId,
    userId: user.id,
    brandName: audit.brand_name,
    brandUrl: audit.brand_url,
    metaAdLibraryUrl: (audit.meta_ad_url as string | null) ?? "",
    instagramHandle: (audit.instagram_handle as string | null) ?? "",
    category: audit.category,
    competitorUrls: (audit.competitor_urls as string[] | null) ?? [],
    status: "complete",
    createdAt: new Date().toISOString(),
    rubricVersion: "1.0",
    modelVersion: "llama-3.3-70b-versatile",
    recommendations: (base.recommendations as Array<Record<string, unknown>>).map((r) => ({
      ...r,
      done: false,
      saved: false,
    })),
    data_sources,
    raw_contexts,
  };

  await supabase
    .from("audits")
    .update({
      status: "complete",
      brand_health_score: brandHealthScore,
      creative_score: creative.score,
      social_score: social.score,
      data: finalData,
    })
    .eq("id", auditId);

  return NextResponse.json({ ok: true });
}
