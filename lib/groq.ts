import { GoogleGenerativeAI } from "@google/generative-ai";
import { AuditOutputSchema, AuditOutput, SYSTEM_PROMPT } from "./rubric";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export type DataAvailability = {
  pdp_health: "HAS_DATA" | "NO_DATA";
  creative: "HAS_DATA" | "NO_DATA";
  social: "HAS_DATA" | "NO_DATA";
  funnel: "HAS_DATA" | "NO_DATA";
  retention: "HAS_DATA" | "NO_DATA";
  seo: "HAS_DATA" | "NO_DATA";
};

export interface AuditInput {
  brandName: string;
  brandUrl: string;
  category: string;
  metaAdLibraryUrl?: string;
  instagramHandle?: string;
  competitorUrls?: string[];
  scrapedContext?: string;
  dataAvailability: DataAvailability;
}

const ANTI_HALLUCINATION_RULES = `ANTI-HALLUCINATION RULES (HIGHEST PRIORITY — OVERRIDE EVERYTHING ELSE):

You will receive a DATA AVAILABILITY section in the user message that tells you which dimensions have real scraped data and which do not.

FOR DIMENSIONS MARKED "HAS_DATA":
- Provide detailed, evidence-based analysis referencing specific elements from the scraped content.
- Score based on what you actually see in the data.
- In whatsWorking and criticalGaps, cite real evidence (e.g., "Found email signup form in footer", "No reviews section detected on product page").

FOR DIMENSIONS MARKED "NO_DATA":
- You MUST still output valid JSON for these dimensions (the schema requires it).
- Set the dimension score to null.
- Set ALL sub-metric scores to null.
- Set ALL sub-metric benchmark to null.
- For whatsWorking: output exactly one item: "Data source not available for this dimension"
- For criticalGaps: output exactly one item: "Provide the required data source to enable analysis"
- For whyThisScore: write exactly: "NO_DATA: This dimension could not be scored. [specific reason — e.g., 'Meta Ad Library was not accessible' or 'Instagram profile could not be scraped']. Provide the required data source to get an accurate score."
- For whyWhyAnalysis entries covering a NO_DATA dimension, use:
    L1: "Dimension data unavailable for direct analysis"
    L2: "Data source was not provided or could not be accessed"
    L3: "Provide the required data source to enable scoring"
- recommendations array MUST contain at least 1 item — never return an empty array.
- Generate recommendations only from dimensions marked HAS_DATA. If only 1–2 dimensions have data, generate 1–3 recommendations from those dimensions only. Scale up to 5 when more dimensions have data.
- If ALL dimensions are NO_DATA (full scraper failure), return exactly one recommendation: title "Provide more data sources", difficulty "Easy", ice all 5, predictedImpact "Enables full 6-dimension audit", impactReasoning "No data was retrievable for any dimension so no evidence-based recommendations can be made", whyWeSaidThis "All dimensions returned NO_DATA", implementationTemplate "Check that the brand URL is publicly accessible, then provide a Meta Ad Library link and Instagram handle so all six dimensions can be scored."

FOR THE OVERALL BRAND HEALTH SCORE:
- If some dimensions have data and some do not, output brandHealthScore as null. The server will compute it from the non-null dimension scores.
- If NO dimensions have data, set brandHealthScore to null.

FOR COMPETITOR BENCHMARK:
- If no scraped data exists for a competitor on a given dimension, set that dimension's score to null.
- Do not guess competitor scores from brand recognition or training knowledge.
- Only use data from the SCRAPED CONTENT section. If a competitor URL was not scraped or returned blocked status, all their dimension scores must be null.
- brandHealth for a competitor may also be null if insufficient dimension data exists.

CRITICAL: Do not use your training knowledge about any brand. If you recognise the brand name, IGNORE what you know about them. Only use the scraped data provided. If no scraped data exists for a dimension, follow the NO_DATA rules above exactly. Making up specific claims like "the brand has high-quality product images" or "growing social media following" when you have no data is strictly forbidden.`;

function buildSystemPrompt(): string {
  return SYSTEM_PROMPT.replace(
    "\nJSON STRUCTURE:\n",
    `\n${ANTI_HALLUCINATION_RULES}\n\nJSON STRUCTURE:\n`
  );
}

function buildUserPrompt(input: AuditInput): string {
  const da = input.dataAvailability;

  const availabilityBlock = [
    "DATA AVAILABILITY:",
    `- PDP Health: ${da.pdp_health}`,
    `- Creative: ${da.creative}`,
    `- Social / Content Authority: ${da.social}`,
    `- Funnel: ${da.funnel}`,
    `- Retention: ${da.retention}`,
    `- SEO: ${da.seo}`,
    "",
    "Only analyze dimensions marked HAS_DATA using the scraped content below.",
    "For NO_DATA dimensions, follow the NO_DATA output rules exactly. Do not infer, estimate, or guess.",
  ].join("\n");

  const lines: string[] = [
    availabilityBlock,
    "",
    `Brand name: ${input.brandName}`,
    `Brand website: ${input.brandUrl}`,
    `Category: ${input.category}`,
  ];

  if (input.metaAdLibraryUrl) lines.push(`Meta Ad Library URL: ${input.metaAdLibraryUrl}`);
  if (input.instagramHandle) lines.push(`Instagram handle: @${input.instagramHandle.replace("@", "")}`);
  if (input.competitorUrls?.filter(Boolean).length) {
    lines.push(`Competitor URLs: ${input.competitorUrls.filter(Boolean).join(", ")}`);
  }

  if (input.scrapedContext) {
    lines.push("", "SCRAPED CONTENT:", input.scrapedContext);
  }

  lines.push("\nGenerate the complete audit JSON for this brand.");
  return lines.join("\n");
}

export async function generateAudit(input: AuditInput): Promise<AuditOutput> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: buildSystemPrompt(),
  });

  const attempt = async (): Promise<AuditOutput> => {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: buildUserPrompt(input) }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 16000,
      },
    });
    const raw = result.response.text();
    return AuditOutputSchema.parse(JSON.parse(raw));
  };

  try {
    return await attempt();
  } catch {
    return await attempt();
  }
}
