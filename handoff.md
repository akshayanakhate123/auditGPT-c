# AuditGPT — Session Handoff

## Goal
Build a production-ready B2B SaaS tool that generates AI-powered D2C brand growth audits.
A user pastes a brand website URL, Meta Ad Library link, and Instagram handle — Groq's
llama-3.3-70b-versatile analyses them across 6 dimensions (PDP, Creative, Social, Funnel,
Retention, SEO) and returns a scored report with ICE-ranked recommendations, competitor
benchmarks, and a downloadable PDF.

Target market: Indian D2C brands and the agencies/consultants that serve them.
Pricing: Free (1 audit/mo) · Pro ₹999/mo · Agency ₹4,999/mo.

---

## Current State

### What's fully working
| Area | Status |
|---|---|
| Full UI (all pages) | ✅ |
| Supabase auth (email + Google OAuth) | ✅ |
| Email confirmation flow | ✅ |
| Forgot / reset password | ✅ |
| Dashboard with real DB stats | ✅ |
| Audit history with delete | ✅ |
| Settings (profile + change password) | ✅ |
| Groq audit generation (real AI) | ✅ |
| Audit report page | ✅ |
| PDF export (5-page A4) | ✅ |
| PDF download from history page | ✅ |
| Share link (copy URL to clipboard) | ✅ |
| "Did you know?" auto-cycling tips card | ✅ |
| Railway scraper — parallel GET calls, 90s retry-loop warm-up | ✅ |
| Anti-hallucination prompt + DATA AVAILABILITY injection | ✅ |
| Null scores for NO_DATA dimensions (Zod schema) | ✅ |
| Server-side brand health recalculation | ✅ |
| Report UI handles null scores gracefully | ✅ |
| BoundedScore fixed in rubric.ts | ✅ |

### What's pending (Phase 5)
- Verify end-to-end audit with real scores (Creative + Social confirmed scraping; need clean test run with max_tokens=7000)
- Seed 6 sample audits to Supabase (currently served from `lib/mock-data.ts` as static JSON)
- Vercel deployment (env vars, build config)

---

## Key Files

### App routes
| File | Purpose |
|---|---|
| `app/page.tsx` | Landing page (server component, reads real auth) |
| `app/dashboard/page.tsx` | Dashboard with real DB stats |
| `app/new-audit/page.tsx` | Audit form → calls POST /api/audit → loading animation → redirect |
| `app/audit/[id]/page.tsx` | Audit report page (samples from mock-data, real audits from DB) |
| `app/history/page.tsx` | Audit list with search, filter, delete |
| `app/samples/page.tsx` | Public sample reports grid |
| `app/settings/page.tsx` | Profile + password settings |
| `app/auth/login/page.tsx` | Email/password + Google sign-in |
| `app/auth/signup/page.tsx` | Sign-up with role field |
| `app/auth/forgot-password/page.tsx` | Send reset email |
| `app/auth/reset-password/page.tsx` | Set new password (manually parses URL hash tokens) |
| `app/auth/callback/route.ts` | Handles OAuth code exchange + email OTP verification |
| `app/auth/confirmed/page.tsx` | Static "email confirmed" success page |
| `app/api/audit/route.ts` | POST — auth → DB insert → scraper → Groq → DB update → return ID |

### Library
| File | Purpose |
|---|---|
| `lib/groq.ts` | `generateAudit()` using groq-sdk, retry-once on failure; `DataAvailability` type; `ANTI_HALLUCINATION_RULES` injected into every system prompt; `max_tokens: 7000` |
| `lib/rubric.ts` | Zod schema for Groq output + SYSTEM_PROMPT; all scores are `NullableBoundedScore`; `BoundedScore` const defined for competitor rows |
| `lib/mock-data.ts` | 6 sample audits + all TypeScript types; all scores typed `number | null`; `Audit.data_sources` field added |
| `lib/supabase/client.ts` | Browser Supabase client (`flowType: "implicit"`) |
| `lib/supabase/server.ts` | Server Supabase client (cookie-based) |
| `proxy.ts` | Route protection middleware (protects /dashboard, /new-audit, /history) |
| `hooks/use-user.ts` | Client hook for real-time auth state |

### Components
| File | Purpose |
|---|---|
| `components/audit-report.tsx` | Full audit report UI; handles null scores, Verified/No data badges, no-data chart replacement; `competitorData` filters null `brandHealth` before passing to recharts |
| `components/audit-pdf.tsx` | react-pdf Document — 5-page A4 PDF; all score renders null-safe |
| `components/pdf-download-button.tsx` | PDFDownloadLink wrapper (dynamic import, client-only) |
| `components/history-pdf-button.tsx` | Fetches audit data on-click → generates + downloads PDF |
| `components/did-you-know.tsx` | Auto-cycling tips card (client component, 4s interval) |
| `components/navbar.tsx` | Top nav with sign-out handler |
| `components/score-gauge.tsx` | Circular score gauge (SVG); renders gray "—" circle when `score === null` |
| `components/score-badge.tsx` | Colour-coded score badge (used in dashboard; call site guards null before passing) |

### Config / DB
| File | Purpose |
|---|---|
| `.env.local` | GROQ_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SCRAPER_API_URL |
| `supabase/schema.sql` | `profiles` + `audits` tables, RLS policies, auto-profile trigger |

### Scraper (UPDATED this session)
- URL: `https://auditgpt-scraper-production.up.railway.app` (env var `SCRAPER_API_URL`)
- **Endpoint (current):** `GET /scrape?url=<encoded>&target=website|meta|instagram` — one call per source, fired in parallel via `Promise.all`
- **Old endpoint (deprecated):** `POST /scrape-audit` — was sequential, took 2+ minutes, was abandoned
- Health check: `GET /` — used in warm-up loop
- Warm-up: polls `GET /` every 3s for up to 90s until Railway responds (handles cold-start)
- Per-source timeout: 90s (via `setTimeout` + `AbortController`); competitor URLs use 45s
- Returns `null` on timeout or any error → graceful degradation to NO_DATA

---

## The Hallucination Problem (What Was Wrong & How It Was Fixed)

### Problem
Groq knew about well-known brands (e.g. Beardo) from training data. Even when the scraper
was blocked or timed out, Groq would generate plausible-looking but completely fabricated
scores for Creative (80) and Social (75) dimensions — pulling from its training knowledge
rather than actual scraped data. The audit looked real but was hallucinated.

### Fix — 6-part refactor
1. **Zod schema**: All dimension scores and sub-metric scores changed to `NullableBoundedScore`
   (allows `number | null`). `brandHealthScore` also nullable.

2. **`DataAvailability` type** in `lib/groq.ts`: Maps each of the 6 dimensions to
   `"HAS_DATA" | "NO_DATA"` based on what the scraper actually returned. Built by
   `buildDimensionAvailability()` in `route.ts`.

3. **`ANTI_HALLUCINATION_RULES`** injected into every Groq system prompt (before the JSON
   structure section). Rules:
   - `HAS_DATA` dimensions: evidence-based analysis from scraped content only
   - `NO_DATA` dimensions: score = null, all sub-metrics = null, standardised whatsWorking/criticalGaps messages
   - `brandHealthScore`: always output null (server recalculates)
   - Explicitly forbids using training knowledge about brands

4. **`DATA AVAILABILITY` block** prepended to every Groq user prompt, listing each dimension
   as `HAS_DATA` or `NO_DATA`. Explicit instruction not to infer missing dimensions.

5. **Server-side brand health**: `computeBrandHealth()` in `route.ts` averages only non-null
   dimension scores. Overwrites whatever `brandHealthScore` Groq returns.

6. **`data_sources` always saved**: The `dataAvailability` object is always written to the
   DB `data` column as `data_sources`, even when the scraper fully fails (all `"NO_DATA"`).

### Mapping of scraper output → dimension availability
```
website.status === "success" || product_page.status === "success" → pdp_health: "HAS_DATA"
meta.status === "success"                                          → creative:   "HAS_DATA"
instagram.status === "success"                                     → social:     "HAS_DATA"
website.status === "success"                                       → funnel:     "HAS_DATA"
website.status === "success"                                       → retention:  "HAS_DATA"
website.status === "success"                                       → seo:        "HAS_DATA"
```

---

## Report UI — Null Score Handling (Completed)

### Changes made
**`lib/mock-data.ts`**
- `SubMetric.score/benchmark`, `SubScoreDetail.score`, `WhyWhyItem.score`, `CompetitorRow.*`,
  `Audit.brandHealthScore` all changed to `number | null`
- Added `data_sources?: { pdp_health?, creative?, social?, funnel?, retention?, seo? } | null`
  to `Audit` interface

**`components/score-gauge.tsx`**
- `score: number → number | null`
- When null: renders gray ring only with "—" text; `showLabel` shows "No data" in gray

**`components/audit-report.tsx`**
- `getDimStatus(audit, dimKey)` helper reads `audit.data_sources` and returns
  `"HAS_DATA" | "NO_DATA" | null` per dimension
- `SubScoreCard` receives `dataStatus` prop; shows:
  - **Verified** badge (emerald) when `HAS_DATA`
  - **No data** badge (gray) when `NO_DATA`
  - No-data info box instead of bar chart when `score === null`
- Hero: null `brandHealthScore` shows "Insufficient data" beneath gauge
- Executive summary: italic note added when any dimension is `NO_DATA`
- Competitor table: null scores render "—" in gray (`scoreColor` guarded)
- WhyWhy: null `item.score` shows "Score: N/A"
- `competitorData` for recharts filters `c.brandHealth !== null` before mapping to chart

**`components/audit-pdf.tsx`**
- `scoreCol(s: number | null)` returns gray for null
- `ScoreBadge`, `DimSection`, sub-metric bars, hero score, dimension grid, competitor table,
  WhyWhy badge all null-safe with `?? "—"`
- When `dim.score === null`, DimSection skips sub-metrics and shows a text note

**`app/samples/page.tsx`**
- Mini dimension score cells guard null before comparison with `=== null ? "#9CA3AF" : score < 40 ?`

---

## Things That Failed (and Why)

### 1. `middleware.ts` naming
Next.js 16 deprecated the `middleware` file convention. Renamed file to `proxy.ts` and the
exported function from `middleware` to `proxy`. Without this the route protection silently did
nothing.

### 2. Password reset showing "Link is invalid or expired"
Root cause: `@supabase/ssr`'s `createBrowserClient` uses cookie storage and does NOT
automatically parse URL hash tokens the way standard `supabase-js` does. Supabase embeds the
recovery token as `#access_token=xxx&type=recovery` in the URL, but the SSR client never
extracts it, so `onAuthStateChange` never fires and the 3s fallback `getUser()` returns null.

Fix: `app/auth/reset-password/page.tsx` manually reads `window.location.hash`, calls
`supabase.auth.setSession({ access_token, refresh_token })`, then clears the hash from the URL.

### 3. Groq audit generation failing with Zod validation errors
Root causes:
- Strict `.length(3)` on arrays — Groq returns 2 or 4 items unpredictably
- `z.number().int()` rejecting scores like `74.5` (Groq sometimes returns floats)
- `difficulty` enum case mismatch (`"medium"` vs `"Medium"`)

Fix: Replaced all strict length constraints with `.min(1)`, replaced `z.number().int()` with
`z.number().transform(Math.round)` piped through bounds checks, added a `.transform()` to
normalise difficulty capitalisation.

### 4. `PDFDownloadLink` `onLoadingComplete` prop not in v4 types
react-pdf v4 removed that prop. Rewrote `pdf-download-button.tsx` to dynamically import
`PDFDownloadLink` and `AuditPdf` via `useEffect` + `Promise.all` and render them only after
both are loaded.

### 5. `useSearchParams()` crash on login page
Next.js 16 requires `<Suspense>` around any component using `useSearchParams()`. Split the
login page into `LoginForm` (uses the hook) wrapped by `LoginPage` which provides the boundary.

### 6. "Email not confirmed" on first sign-in
Supabase requires email confirmation by default. Fixed by disabling it in Supabase Dashboard →
Authentication → Providers → Email → "Confirm email" toggle off (for dev). Will need a proper
transactional email setup before production.

### 7. Beardo scraper timeout → Groq hallucination
Railway cold-start caused the scraper to exceed the 90s timeout. `data_sources` was saved as
`null`, and Groq fabricated Creative=80, Social=75 from training memory. Fix was the full 6-part
anti-hallucination refactor above. The bad record (ID: `091509a6-1f78-446c-8fb9-15227bfa5ce9`)
was manually corrected via Supabase dashboard.

### 8. `BoundedScore` undefined in `lib/rubric.ts`
`BoundedScore` was referenced in `CompetitorRowSchema` but never defined after the
NullableBoundedScore refactor. Caused a runtime `ReferenceError` on module load → all
audit POSTs returned 500. Fixed by replacing every `BoundedScore` reference with
`NullableBoundedScore` in `CompetitorRowSchema`.

### 9. All NO_DATA — wrong scraper endpoint
Code was calling `POST /scrape-audit` which POSTs a full payload and scrapes all sources
sequentially server-side. That took 2+ minutes and always timed out. Fixed by rewriting
`callScraper()` in `route.ts` to fire parallel `GET /scrape?url=...&target=...` calls
via `Promise.all`.

### 10. All NO_DATA — Railway cold-start > 60s timeout
When Railway is cold, the Python process + headless Chrome browser take 60–90s+ to initialise.
The original code used a single 30s `AbortSignal.timeout()` ping and a fixed 60s per-source
timeout. Both fired before Railway was ready. Confirmed by: Node.js test returned HTTP 000 with
`elapsed=40s` on a fresh cold request.

Fix: replaced fixed warm-up with a retry loop that polls `GET /` every 3s for up to 90s. Once
the loop exits with `railwayReady=true`, Railway is confirmed ready and scrapes finish in 5–10s.
`maxDuration` bumped from 150 → 200 to accommodate 90s warm-up + 90s scraping + Groq.

### 11. Railway HTTP 499 (client disconnected)
After raising the per-source timeout to 60s, Railway's scraper was still mid-scrape when our
`AbortController` fired at exactly 60s. Railway logged: `totalDuration: 59863ms, client closed
connection`. Fix: raised per-source timeout to 90s so Railway always finishes before we abort.

### 12. Groq 429 daily token limit (100k TPD)
Hit the 100,000 tokens-per-day limit on the original Groq API key after several test runs.
Error: `Rate limit reached ... Limit 100000, Used 92886 ... Please try again in 1h3m`.
Fix: switched to a new Groq API key from a different account (org `org_01ksm4wcc4ezct8p6rsd009q59`).

### 13. Groq 413 request too large (TPM)
New account has a 12,000 tokens-per-minute limit. With `max_tokens: 8192`, the request was
4,339 input + 8,192 max_tokens = 12,531 — 531 tokens over the limit.
Error: `413 Request too large ... Limit 12000, Requested 12531`.
Fix: reduced `max_tokens` from 8192 → 7000 in `lib/groq.ts`. New budget: ~4,339 + 7,000 = 11,339 < 12,000.

### 14. Turbopack "Jest worker encountered 2 child process exceptions"
Stale Turbopack `.next` cache after several hot-reload cycles. Fixed by stopping the dev
server, deleting the `.next` folder, and restarting with `npm run dev`.

### 15. beardo.in blocks headless Chrome
The Railway scraper (headless Chrome via Playwright) returns `status: "blocked"` for beardo.in
homepage. This is expected anti-bot protection — not a code bug. Meta Ad Library and Instagram
scrape successfully. The system correctly maps `website=blocked` → `pdp/funnel/retention/seo = NO_DATA`.

---

## Known Issues / Debt

| Issue | Severity | Notes |
|---|---|---|
| Debug `console.log` statements in `callScraper()` | Low | Remove once end-to-end test passes cleanly |
| `??` unreachable operand warnings in `route.ts` | Low | Pre-existing; cosmetic only |
| Competitor benchmark scores not nullable in Groq prompt | Low | Model always fills them in; not a real risk |
| beardo.in (and similar D2C brands) block headless Chrome | Medium | Only Meta + Instagram data is available for bot-protected brands |
| Groq free-tier 12k TPM limit | Medium | With max_tokens=7000 it fits; but large scraped contexts could push input tokens higher |

---

## Current .env.local

```
GROQ_API_KEY=<your-groq-api-key>
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SCRAPER_API_URL=https://auditgpt-scraper-production.up.railway.app
```

---

## Next Steps (Phase 5)

### IMMEDIATE — Verify end-to-end with fix applied
1. Run `npm run dev`, submit a new audit (any brand with a Meta Ad Library URL + Instagram handle)
2. Expected dev-server logs:
   ```
   [scraper] warm-up: railwayReady=true elapsed=Xms
   [scraper] website HTTP 200 → status=success|blocked
   [scraper] instagram HTTP 200 → status=success
   [scraper] meta HTTP 200 → status=success
   [scraper] results: website=... meta=success instagram=success
   POST /api/audit 200 in ~50-130s
   ```
3. Check Supabase latest `audits` row: `creative_score` and `social_score` should be real integers
4. Open the audit report — Creative and Social cards should show **Verified** badge + real scores
5. Once confirmed, remove the 5 `console.log` statements from `callScraper()` in `route.ts`

### 2. Seed sample audits to Supabase
The 6 sample audits in `lib/mock-data.ts` are served as static mock data. For production,
they should live in Supabase so they appear consistently across deployments.

Approach:
- Write a one-off seed script (`scripts/seed-samples.ts`) that iterates `SAMPLE_AUDITS` from
  `lib/mock-data.ts` and upserts each into the `audits` table with a fixed UUID and
  `user_id = NULL` (requires a schema change allowing null user_id for samples, or a dedicated
  `samples` table)
- Update `app/audit/[id]/page.tsx` `getAudit()` to query the DB for sample IDs instead of
  returning from the array

### 3. Vercel deployment
- Add all `.env.local` keys as Vercel environment variables (including `SCRAPER_API_URL`)
- Add `https://your-vercel-domain.com/auth/callback` to Supabase → Auth → URL Configuration →
  Redirect URLs
- Set `NEXT_PUBLIC_SUPABASE_URL` Site URL in Supabase to the Vercel domain
- Run `vercel deploy` — no special build config needed, `next build` works as-is
- Test the full auth flow (sign up, email confirm, password reset) on the live domain since the
  reset link uses `window.location.origin` which must match the registered redirect URL

### 4. Nice-to-have before launch
- Re-run audit button (currently links to /new-audit; could pre-fill form with the previous brand's inputs)
- Mobile responsive QA pass (the report table and competitor benchmark are not tested on mobile)
- Upgrade Supabase email templates to use the project's branding
- Consider upgrading Groq account to get higher TPM limit (current 12k TPM is tight with large scraped contexts)

---

## Dev Environment
- **Start server:** `npm run dev` → http://localhost:5001
- **Stack:** Next.js 16.2.6, React 19, TypeScript, Tailwind v4, Supabase (SSR v0.10.3),
  Groq SDK v1.2.0, react-pdf v4.5.1, Zod v4.4.3, Recharts v3
- **Project dir:** `D:\AI projects\auditGPT c`
- **Scraper:** `https://auditgpt-scraper-production.up.railway.app` (Railway, headless Chrome via Playwright)
