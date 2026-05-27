import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAudit, generateDimension, DataAvailability } from "@/lib/groq";
import { warmUpScraper, scrapeUrl, buildWebsiteContext, ScraperPage } from "@/lib/scraper";
import { z } from "zod";

export const maxDuration = 200;

const NO_DATA_ALL: DataAvailability = {
  pdp_health: "NO_DATA",
  creative: "NO_DATA",
  social: "NO_DATA",
  funnel: "NO_DATA",
  retention: "NO_DATA",
  seo: "NO_DATA",
};

const SectionBodySchema = z.discriminatedUnion("section", [
  z.object({
    section: z.literal("website"),
    product_url: z.string().url().optional(),
  }),
  z.object({
    section: z.literal("meta"),
    metaAdUrl: z.string().url(),
  }),
  z.object({
    section: z.literal("instagram"),
    instagramHandle: z.string().min(1),
  }),
  z.object({
    section: z.literal("competitors"),
    competitorUrls: z.array(z.string().url()).min(1),
  }),
]);

export async function POST(
  request: Request,
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
    .select("brand_name, brand_url, category, data")
    .eq("id", auditId)
    .eq("user_id", user.id)
    .single();

  if (!audit) return NextResponse.json({ error: "Audit not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SectionBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const brandName = audit.brand_name as string;
  const brandUrl = audit.brand_url as string;
  const category = audit.category as string;

  const auditData = audit.data as Record<string, unknown> | null;

  async function patchData(
    sectionKey: string,
    sectionData: Record<string, unknown>,
    scoreUpdates: Record<string, number | null> = {}
  ) {
    const currentData = auditData ?? {};
    const existingSections = (currentData.sections as Record<string, unknown>) ?? {};
    const merged = {
      ...currentData,
      sections: { ...existingSections, [sectionKey]: sectionData },
    };
    await supabase
      .from("audits")
      .update({ data: merged, ...scoreUpdates })
      .eq("id", auditId);
  }

  // ── WEBSITE ──────────────────────────────────────────────────────────────────
  if (input.section === "website") {
    await warmUpScraper(90_000);

    const [websiteResult, productResult] = await Promise.all([
      scrapeUrl(brandUrl, "website", 90_000),
      input.product_url ? scrapeUrl(input.product_url, "website", 90_000) : Promise.resolve(null),
    ]);

    const websiteOk = (websiteResult as unknown as ScraperPage | null)?.status === "success";
    const productOk = (productResult as unknown as ScraperPage | null)?.status === "success";

    const dataAvailability: DataAvailability = {
      pdp_health: websiteOk || productOk ? "HAS_DATA" : "NO_DATA",
      creative: "NO_DATA",
      social: "NO_DATA",
      funnel: websiteOk ? "HAS_DATA" : "NO_DATA",
      retention: websiteOk ? "HAS_DATA" : "NO_DATA",
      seo: websiteOk ? "HAS_DATA" : "NO_DATA",
    };

    const scrapedContext = websiteResult
      ? buildWebsiteContext(
          websiteResult as unknown as ScraperPage,
          productResult as unknown as ScraperPage | null
        )
      : undefined;

    const output = await generateAudit({
      brandName,
      brandUrl,
      category,
      scrapedContext,
      dataAvailability,
    });

    await patchData(
      "website",
      { output, data_sources: dataAvailability, raw_context: scrapedContext ?? null },
      {
        pdp_score: output.pdp.score,
        funnel_score: output.funnel.score,
        retention_score: output.retention.score,
        seo_score: output.seo.score,
      }
    );

    return NextResponse.json({ ok: true });
  }

  // ── META ──────────────────────────────────────────────────────────────────────
  if (input.section === "meta") {
    await warmUpScraper(15_000);

    const metaResult = await scrapeUrl(input.metaAdUrl, "meta", 90_000);
    const metaOk = (metaResult as { status?: string } | null)?.status === "success";

    const dataAvailability: DataAvailability = {
      ...NO_DATA_ALL,
      creative: metaOk ? "HAS_DATA" : "NO_DATA",
    };

    const scrapedContext = metaOk
      ? `--- META AD LIBRARY DATA ---\nContent: ${String(
          (metaResult as Record<string, unknown>)?.content ?? ""
        ).slice(0, 2000)}`
      : undefined;

    let creativeOutput;
    try {
      creativeOutput = await generateDimension({
        brandName,
        brandUrl,
        category,
        metaAdLibraryUrl: input.metaAdUrl,
        scrapedContext,
        dataAvailability,
      }, "creative");
    } catch (e) {
      console.error("Meta dimension generation failed:", e);
      creativeOutput = {
        score: null,
        subMetrics: [
          { name: "Image-to-Video Ratio", score: null, benchmark: null },
          { name: "Active Ad Count", score: null, benchmark: null },
          { name: "Creative Refresh Rate", score: null, benchmark: null },
          { name: "Hook Diversity", score: null, benchmark: null },
          { name: "UGC Integration", score: null, benchmark: null },
          { name: "Brand Consistency", score: null, benchmark: null }
        ],
        whatsWorking: ["Data source not available or analysis failed"],
        criticalGaps: ["Provide the required data source to enable analysis"],
        whyThisScore: "NO_DATA: Analysis failed or data was blocked."
      };
    }

    await patchData(
      "meta",
      { creative: creativeOutput, data_source: metaOk ? "HAS_DATA" : "NO_DATA", raw_context: scrapedContext ?? null },
      { creative_score: creativeOutput.score }
    );

    return NextResponse.json({ ok: true });
  }

  // ── INSTAGRAM ─────────────────────────────────────────────────────────────────
  if (input.section === "instagram") {
    await warmUpScraper(15_000);

    const igUrl = `https://www.instagram.com/${input.instagramHandle}/`;
    const igResult = await scrapeUrl(igUrl, "instagram", 90_000);
    const igOk = (igResult as { status?: string } | null)?.status === "success";

    const dataAvailability: DataAvailability = {
      ...NO_DATA_ALL,
      social: igOk ? "HAS_DATA" : "NO_DATA",
    };

    const scrapedContext = igOk
      ? `--- INSTAGRAM DATA ---\nContent: ${String(
          (igResult as Record<string, unknown>)?.content ?? ""
        ).slice(0, 2000)}`
      : undefined;

    let socialOutput;
    try {
      socialOutput = await generateDimension({
        brandName,
        brandUrl,
        category,
        instagramHandle: input.instagramHandle,
        scrapedContext,
        dataAvailability,
      }, "social");
    } catch (e) {
      console.error("Instagram dimension generation failed:", e);
      socialOutput = {
        score: null,
        subMetrics: [
          { name: "Follower Count", score: null, benchmark: null },
          { name: "Post Frequency", score: null, benchmark: null },
          { name: "Reels Ratio", score: null, benchmark: null },
          { name: "Avg. Engagement Rate", score: null, benchmark: null },
          { name: "UGC Volume", score: null, benchmark: null },
          { name: "Community Response Rate", score: null, benchmark: null }
        ],
        whatsWorking: ["Data source not available or analysis failed"],
        criticalGaps: ["Provide the required data source to enable analysis"],
        whyThisScore: "NO_DATA: Analysis failed or data was blocked."
      };
    }

    await patchData(
      "instagram",
      { social: socialOutput, data_source: igOk ? "HAS_DATA" : "NO_DATA", raw_context: scrapedContext ?? null },
      { social_score: socialOutput.score }
    );

    return NextResponse.json({ ok: true });
  }

  // ── COMPETITORS ───────────────────────────────────────────────────────────────
  if (input.section === "competitors") {
    await warmUpScraper(15_000);

    const scraped = await Promise.all(
      input.competitorUrls.map((url) => scrapeUrl(url, "website", 45_000))
    );

    await patchData("competitors", { scraped, urls: input.competitorUrls });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown section" }, { status: 400 });
}
