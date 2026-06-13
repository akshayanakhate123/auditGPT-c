# AuditGPT — Session Handoff

## Goal
Build a production-ready B2B SaaS tool that generates AI-powered D2C brand growth audits.
A user fills in up to 4 sections (brand website, Meta Ad Library, Instagram, competitors) —
each section is scraped and analysed independently by Gemini 2.5 Flash across 6 dimensions
(PDP, Creative, Social, Funnel, Retention, SEO). Results are merged into one scored report
with ICE-ranked recommendations, competitor benchmarks, and a downloadable PDF.

Target market: Indian D2C brands and the agencies/consultants that serve them.
Pricing: Free (1 audit/mo) · Pro ₹999/mo · Agency ₹4,999/mo.

---

## Current State

### What's fully working
| Area | Status |
|---|---|
| Full UI (all pages) | ✅ |
| Supabase auth (email + Google OAuth, password reset) | ✅ |
| Dashboard, history, settings with real DB data | ✅ |
| New audit form — 4 independent sections | ✅ |
| Per-section sequential API calls (no parallel Groq overload) | ✅ |
| Section-by-section loading screen (running / done / skipped) | ✅ |
| Gemini 2.5 Flash replacing Groq llama-3.3-70b | ✅ |
| Anti-hallucination prompt + DATA AVAILABILITY injection | ✅ |
| Null scores for NO_DATA dimensions (Zod schema) | ✅ |
| Server-side brand health recalculation | ✅ |
| Report UI handles null scores gracefully | ✅ |
| PDF export (5-page A4) + download from history | ✅ |
| Share links | ✅ |
| Railway scraper (parallel GET calls, 90s retry warm-up) | ✅ |
| Single-dimension AI generation for auxiliary sections | ✅ |
| Scraper raw debug context UI on report | ✅ |

### What's pending (Phase 5)
1. **End-to-end verification** — ✅ CONFIRMED: website section returns 200 in ~55s with real scores.
   Remaining: open the report UI and verify PDP/Funnel/Retention/SEO show real scores and
   Creative/Social show "No data" banners. Then remove 5 debug `console.log` calls in
   `app/api/audit/[id]/section/route.ts`.
2. **Seed 6 sample audits to Supabase** — Currently served from `lib/mock-data.ts` as static
   JSON; need a seed script + DB query update in `app/audit/[id]/page.tsx`
3. **Vercel deployment** — Add all `.env.local` keys as Vercel env vars, update Supabase
   redirect URLs, run `vercel deploy`

---

## Architecture — New API Structure (this session)

The old single-endpoint design hit Groq's 12k TPM limit. The new design runs each section
independently with its own smaller Gemini call.

### Client flow (app/new-audit/page.tsx)
Sequential POST calls — each awaited before the next starts:
1. `POST /api/audit` → creates DB record → returns `{ id }`
2. `POST /api/audit/{id}/section` `{ section: "website" }` → scrape + Gemini → patch DB
3. `POST /api/audit/{id}/section` `{ section: "meta" }` → scrape + Gemini → patch DB (skipped if no URL)
4. `POST /api/audit/{id}/section` `{ section: "instagram" }` → scrape + Gemini → patch DB (skipped if no handle)
5. `POST /api/audit/{id}/section` `{ section: "competitors" }` → scrape only, no Gemini (skipped if no URLs)
6. `POST /api/audit/{id}/finalize` → merge all section outputs → compute brand health → status=complete

### Key files
| File | Purpose |
|---|---|
| `app/new-audit/page.tsx` | 4-section form + sequential section-by-section loading UI |
| `app/api/audit/route.ts` | Init only — validates input, creates DB record, returns ID |
| `app/api/audit/[id]/section/route.ts` | Per-section handler: scrape + Gemini call + DB patch |
| `app/api/audit/[id]/finalize/route.ts` | Merge all section outputs, compute brand health, mark complete |
| `lib/groq.ts` | Gemini client (filename kept for import compatibility); exports `generateAudit`, `DataAvailability`, `AuditInput` |
| `lib/scraper.ts` | Scraper utilities: `warmUpScraper()`, `scrapeUrl()`, `buildWebsiteContext()`, types |
| `lib/rubric.ts` | Zod schema for Gemini output + SYSTEM_PROMPT |
| `lib/mock-data.ts` | 6 sample audits (static, pending DB seed) |

### Section → dimension mapping
| Section | Dimensions analysed | Gemini call? |
|---|---|---|
| website | pdp_health, funnel, retention, seo | Yes |
| meta | creative | Yes |
| instagram | social | Yes |
| competitors | (none — scrape only) | No |

### DB storage during processing
Section outputs are stored in `data.sections.{website|meta|instagram|competitors}` in the
Supabase `audits.data` JSONB column. Finalize reads these and assembles the final flat structure
that the report page expects. We also capture `raw_contexts` during each section patch so the 
UI can render the raw scraper output for debugging.

---

## Gemini Migration & Updates

| | Before | After |
|---|---|---|
| SDK | `groq-sdk ^1.2.0` | `@google/generative-ai` |
| Model | `llama-3.3-70b-versatile` | `gemini-flash-latest` (Swapped from 2.5/2.0 due to quota) |
| Token limit issue | 12k TPM (Groq free tier) | 1M context window — no limit issue |
| Env var | `GROQ_API_KEY` | `GEMINI_API_KEY` |
| Output tokens | `max_tokens: 7000` (then 6000) | `maxOutputTokens: 16000` |

---

## Things That Failed (this session)

### 1. 500 Errors on Scraper Failures
**Issue:** When the Meta or Instagram scraper hit a login wall or was blocked, it returned an empty or irrelevant payload. Gemini would fail to construct the massive 6-dimension JSON schema out of this missing data, causing Zod to throw a 500 validation error in the route.
**Fix:** Created a `generateDimension` function that only asks Gemini for the *single* dimension (e.g. `creative` or `social`) using a heavily stripped-down JSON schema (`DimensionSchema`). Added `try/catch` boundaries in the route so that if Gemini fails to output a score (e.g. because it's a login page), it falls back to a safe `NO_DATA` object rather than crashing the route. Added `raw_contexts` blocks to the report UI to make debugging scraper blocks transparent.

### 2. maxOutputTokens: 6000 caused JSON truncation with Gemini
Gemini's tokenizer packs fewer characters per token than Groq's. The full audit JSON
exceeded 6000 tokens at ~position 6428, causing `SyntaxError: Unterminated string in JSON`.
**Fix:** Raised `maxOutputTokens` from 6000 → 16000 in `lib/groq.ts`.

---

## Known Issues / Debt

| Issue | Severity | Notes |
|---|---|---|
| Debug `console.log` statements in section route | Low | Remove once end-to-end test passes cleanly |
| Competitors section stores scraped data but never feeds it to Gemini | Medium | Competitor benchmark uses website-section Gemini output (generic), not real scraped competitor data. Future: pass competitor context into finalize or website section |
| `??` unreachable operand warnings in route.ts | Low | Pre-existing; cosmetic only |
| beardo.in (and similar D2C brands) block headless Chrome | Medium | Only Meta + Instagram data available for bot-protected brands |
| GEMINI_API_KEY was shared in conversation text | High | User must regenerate key at aistudio.google.com |
| Recommendations only reflect website section dimensions | Medium | Creative/social section recs not merged into final report — website section recs used as base |

---

## Current .env.local

```
GEMINI_API_KEY=<regenerate at aistudio.google.com — old key was shared in conversation>
NEXT_PUBLIC_SUPABASE_URL=https://unmzltnmshmzsvousfts.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<set>
SUPABASE_SERVICE_ROLE_KEY=<set>
SCRAPER_API_URL=https://auditgpt-scraper-production.up.railway.app
```

---

## Next Steps (Phase 5)

### IMMEDIATE — Verify end-to-end with new architecture
1. Run `npm run dev`, go to `/new-audit`
2. Fill in brand name + URL + category only (skip meta/instagram/competitors)
3. Expected loading screen: steps 0+1 run, steps 2+3+4 show "Skipped", step 5 runs
4. Expected server logs in the website section call:
   ```
   [scraper] warm-up: railwayReady=true elapsed=Xms
   POST /api/audit/{id}/section 200 in ~50-130s
   POST /api/audit/{id}/finalize 200 in <1s
   ```
5. Open the audit report — PDP, Funnel, Retention, SEO should show real scores
6. Creative + Social should show "No data" banners and UI elements correctly indicating unavailable data
7. Verify the Raw Scraped Data section at the bottom to check scraper health

### 2. Seed sample audits to Supabase
- Write `scripts/seed-samples.ts` that upserts `SAMPLE_AUDITS` from `lib/mock-data.ts`
- Update `app/audit/[id]/page.tsx` `getAudit()` to query DB for sample IDs instead of
  returning from the static array

### 3. Vercel deployment
- Add all `.env.local` keys as Vercel environment variables (including `SCRAPER_API_URL` and `GEMINI_API_KEY`)
- Add `https://your-vercel-domain.com/auth/callback` to Supabase → Auth → URL Configuration → Redirect URLs
- Set `NEXT_PUBLIC_SUPABASE_URL` Site URL in Supabase to the Vercel domain
- Run `vercel deploy`

### 4. Future improvements (not blocking launch)
- Feed competitor scraped content into Gemini for real competitor benchmark scores
- Merge meta + instagram section recommendations into final report alongside website recs
- Re-run audit button pre-filling previous brand inputs
- Mobile responsive QA pass on report table and competitor benchmark
- Upgrade Supabase email templates to project branding

---

## Dev Environment
- **Start server:** `npm run dev` → http://localhost:5001
- **Stack:** Next.js 16.2.6, React 19, TypeScript, Tailwind v4, Supabase SSR v0.10.3,
  @google/generative-ai, react-pdf v4.5.1, Zod v4.4.3, Recharts v3
- **Project dir:** `D:\AI projects\auditGPT c`
- **Scraper:** `https://auditgpt-scraper-production.up.railway.app` (Railway, headless Chrome via Playwright)
