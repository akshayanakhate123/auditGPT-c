import { format, subDays, subHours, subMonths } from "date-fns";

export type AuditStatus = "complete" | "processing" | "failed";

export interface SubMetric {
  name: string;
  score: number | null;
  benchmark: number | null;
}

export interface SubScoreDetail {
  score: number | null;
  subMetrics: SubMetric[];
  whatsWorking: string[];
  criticalGaps: string[];
  whyThisScore: string;
}

export interface WhyWhyLevel {
  level: "L1" | "L2" | "L3";
  label: string;
  content: string;
}

export interface WhyWhyItem {
  dimension: string;
  score: number | null;
  levels: WhyWhyLevel[];
}

export interface ICEBar {
  impact: number;
  confidence: number;
  ease: number;
}

export interface Recommendation {
  title: string;
  predictedImpact: string;
  impactReasoning: string;
  ice: ICEBar;
  difficulty: "Easy" | "Medium" | "Hard";
  whyWeSaidThis: string;
  implementationTemplate: string;
  done: boolean;
  saved: boolean;
}

export interface CompetitorRow {
  brand: string;
  brandHealth: number | null;
  pdp: number | null;
  creative: number | null;
  social: number | null;
  funnel: number | null;
  retention: number | null;
  seo: number | null;
  isAudited?: boolean;
}

export interface UpsellRow {
  service: string;
  currentStatus: string;
  priority: number;
  pitchAngle: string;
}

export interface Audit {
  id: string;
  userId?: string;
  brandName: string;
  brandUrl: string;
  metaAdLibraryUrl: string;
  instagramHandle: string;
  category: string;
  competitorUrls: string[];
  aboutBrand: string;
  brandHealthScore: number | null;
  executiveSummary: string;
  strategicOneLiner: string;
  pdp: SubScoreDetail;
  creative: SubScoreDetail;
  social: SubScoreDetail;
  funnel: SubScoreDetail;
  retention: SubScoreDetail;
  seo: SubScoreDetail;
  whyWhyAnalysis: WhyWhyItem[];
  recommendations: Recommendation[];
  competitorBenchmark: CompetitorRow[];
  competitorTakeaway: string;
  upsellPriority: UpsellRow[];
  status: AuditStatus;
  createdAt: Date;
  rubricVersion: string;
  modelVersion: string;
  data_sources?: {
    pdp_health?: "HAS_DATA" | "NO_DATA";
    creative?: "HAS_DATA" | "NO_DATA";
    social?: "HAS_DATA" | "NO_DATA";
    funnel?: "HAS_DATA" | "NO_DATA";
    retention?: "HAS_DATA" | "NO_DATA";
    seo?: "HAS_DATA" | "NO_DATA";
  } | null;
}

// ─── Sample Audit 1: Wellness / Strong overall (82) ───────────────────────────
export const sampleAudit1: Audit = {
  id: "sample-1",
  brandName: "Wellbeing Co.",
  brandUrl: "https://wellbeingco.in",
  metaAdLibraryUrl: "https://facebook.com/ads/library",
  instagramHandle: "@wellbeingco",
  category: "Wellness",
  competitorUrls: [],
  aboutBrand:
    "Wellbeing Co. is a premium Indian wellness brand founded in 2019, offering a curated range of Ayurvedic supplements, adaptogen blends, and functional nutrition products. With a strong DTC presence and a loyal subscriber base of ~40,000 customers, the brand has built credibility through clinical transparency and third-party lab certificates displayed prominently across their PDP. They position themselves at the intersection of modern science and traditional Ayurveda, evidenced by their product naming convention and detailed ingredient sourcing pages. Revenue signals suggest they are operating in the ₹15–25 Cr ARR range, with subscription contributing ~38% of topline.",
  brandHealthScore: 82,
  executiveSummary:
    "Wellbeing Co. has built an exceptional foundation, clinical transparency, high-quality creatives, and strong retention mechanics are all firing. The primary growth lever now is scaling paid acquisition more aggressively, as their SEO moat is under-leveraged.",
  strategicOneLiner:
    "Clinical credibility and subscriber loyalty are their superpower, but a thin paid creative pipeline means they're leaving 40% of their addressable audience untouched. Fix the top-of-funnel and compound the retention engine they've already built.",
  pdp: {
    score: 85,
    subMetrics: [
      { name: "Hero Image Quality", score: 90, benchmark: 75 },
      { name: "Copy Clarity", score: 88, benchmark: 70 },
      { name: "Social Proof Density", score: 82, benchmark: 65 },
      { name: "CTA Prominence", score: 78, benchmark: 72 },
      { name: "Trust Signals", score: 92, benchmark: 68 },
      { name: "Mobile UX", score: 80, benchmark: 71 },
    ],
    whatsWorking: [
      "Lab test certificates displayed inline on product pages reduce purchase hesitation significantly.",
      "Benefit-led copy with ingredient callouts answers the #1 shopper objection before they scroll.",
      "Star-rating widget with verified purchase filter boosts review credibility.",
    ],
    criticalGaps: [
      "CTA button is below the fold on mobile for 2 of their top 3 SKUs, losing ~15% of clicks.",
      "No sticky add-to-cart bar during scroll, high drop-off between description and price section.",
      "Video explainer missing on hero section despite having good production budget.",
    ],
    whyThisScore:
      "PDPs score 85 because trust infrastructure is exceptional (lab certs, verified reviews, ingredient transparency, all >80th percentile for Wellness), but the conversion mechanics (CTA placement, sticky bar) are under-optimised, costing ~5 points.",
  },
  creative: {
    score: 72,
    subMetrics: [
      { name: "Image-to-Video Ratio", score: 60, benchmark: 65 },
      { name: "Active Ad Count", score: 78, benchmark: 60 },
      { name: "Creative Refresh Rate", score: 65, benchmark: 58 },
      { name: "Hook Diversity", score: 70, benchmark: 62 },
      { name: "UGC Integration", score: 82, benchmark: 55 },
      { name: "Brand Consistency", score: 88, benchmark: 74 },
    ],
    whatsWorking: [
      "UGC-style testimonial ads achieve 3.2x higher click-through than brand creatives, correctly over-indexed.",
      "Consistent visual identity (sage green, minimal layout) builds brand recall across touchpoints.",
      "Problem-solution ad format in top performers maps precisely to customer pain vocabulary.",
    ],
    criticalGaps: [
      "Video ads make up only 22% of active creatives vs. 45% category benchmark, missing Reels and Stories reach.",
      "Hook diversity is low, 60% of ads open with 'Are you struggling with...' framing, showing creative fatigue.",
      "No seasonal or event-triggered creative calendar visible, missing Navratri, New Year health resolution windows.",
    ],
    whyThisScore:
      "Creative scores 72 because the quality bar is high but volume and format diversity are insufficient for scale. UGC is strong, static creatives are polished, but the absence of video and hook variety caps potential ROAS.",
  },
  social: {
    score: 88,
    subMetrics: [
      { name: "Follower Count", score: 85, benchmark: 70 },
      { name: "Post Frequency", score: 90, benchmark: 65 },
      { name: "Reels Ratio", score: 88, benchmark: 60 },
      { name: "Avg. Engagement Rate", score: 92, benchmark: 55 },
      { name: "UGC Volume", score: 86, benchmark: 58 },
      { name: "Community Response Rate", score: 82, benchmark: 62 },
    ],
    whatsWorking: [
      "Engagement rate of 4.8% on Reels is 2.3x the Wellness category average, content resonates deeply.",
      "Founder-led content series drives 5x the saves vs. product posts, building lasting brand authority.",
      "Reply rate under 4 hours to comments signals active community management and builds trust.",
    ],
    criticalGaps: [
      "Instagram Stories conversion rate is unmeasured, no link sticker strategy evident in content plan.",
      "UGC reposts are not systematically collected; a dedicated hashtag campaign could double user content.",
      "No LinkedIn presence despite B2B gifting being a high-AOV opportunity for this category.",
    ],
    whyThisScore:
      "Social scores 88 because the content quality and community health are genuinely exceptional, engagement and Reels performance place them in the top decile. Minor gaps in Stories conversion and UGC systematization hold back a perfect score.",
  },
  funnel: {
    score: 76,
    subMetrics: [
      { name: "Awareness to Landing", score: 80, benchmark: 68 },
      { name: "Landing to PDP", score: 72, benchmark: 65 },
      { name: "PDP to Cart", score: 68, benchmark: 62 },
      { name: "Cart to Checkout", score: 82, benchmark: 70 },
      { name: "Checkout Completion", score: 78, benchmark: 66 },
      { name: "Persona Mapping", score: 74, benchmark: 60 },
    ],
    whatsWorking: [
      "Cart abandonment rate is below category average, suggesting strong intent capture at add-to-cart stage.",
      "Subscription upsell at checkout converts at 12%, above the 8% wellness benchmark.",
      "Loyalty programme teaser at cart page is reducing single-purchase exits.",
    ],
    criticalGaps: [
      "PDP-to-cart conversion is the weakest funnel node at ~4.2%, industry benchmark is 6-8%.",
      "No exit-intent popup or discount mechanism to recover abandoning visitors from PDP.",
      "Homepage traffic lacks a clear navigation journey for first-time visitors, too many equal CTAs.",
    ],
    whyThisScore:
      "Funnel scores 76 because the mid and bottom funnel are above benchmark, but the top-funnel clarity (homepage journey, PDP-to-cart) is the primary conversion leak, estimated at ~20% recoverable revenue.",
  },
  retention: {
    score: 84,
    subMetrics: [
      { name: "Email Capture Rate", score: 88, benchmark: 65 },
      { name: "Subscription Rate", score: 90, benchmark: 55 },
      { name: "Post-Purchase Flow", score: 82, benchmark: 60 },
      { name: "Loyalty Programme", score: 78, benchmark: 52 },
      { name: "Referral Mechanism", score: 72, benchmark: 48 },
      { name: "Repeat Purchase Rate", score: 86, benchmark: 62 },
    ],
    whatsWorking: [
      "Subscription opt-in at 38% of revenue is best-in-class for the Wellness category, sticky revenue base.",
      "Post-purchase email sequence is 5 touches with educational content, reducing cancel rates by ~18%.",
      "Loyalty points programme has 62% activation rate among repeat buyers, above industry norm.",
    ],
    criticalGaps: [
      "Referral mechanism exists but is under-promoted, only 8% of customers know about it per survey data.",
      "Win-back flow for churned subscribers is a single email, needs a 3-touch recovery sequence.",
      "No SMS channel active despite 70%+ mobile traffic, missing high-open-rate retention channel.",
    ],
    whyThisScore:
      "Retention scores 84 because subscriptions and repeat purchase are exceptional, but the referral programme is structurally invisible and there is no SMS strategy in place, leaving a significant retention amplification opportunity untapped.",
  },
  seo: {
    score: 68,
    subMetrics: [
      { name: "Organic Traffic Share", score: 60, benchmark: 55 },
      { name: "Blog Presence", score: 55, benchmark: 58 },
      { name: "On-Page Optimisation", score: 72, benchmark: 66 },
      { name: "Core Web Vitals", score: 75, benchmark: 70 },
      { name: "Backlink Profile", score: 62, benchmark: 60 },
      { name: "Category Keywords", score: 58, benchmark: 62 },
    ],
    whatsWorking: [
      "Core Web Vitals pass all three thresholds, fast load times reduce bounce and improve rankings.",
      "Product schema markup is correctly implemented, enabling rich snippets in SERPs.",
      "Homepage title tag and meta description are click-optimised with primary keyword in first 60 characters.",
    ],
    criticalGaps: [
      "Blog publishes only 1 post per month, competitors in this space publish 8-12 posts, creating a growing content gap.",
      "No informational intent content targeting 'ashwagandha dosage', 'best adaptogens for stress', high-volume, high-intent keywords.",
      "Internal linking structure is flat, product pages have only 2-3 internal links vs. 10+ recommended.",
    ],
    whyThisScore:
      "SEO scores 68 because technical foundations are solid but content velocity and topical authority are insufficient. The brand is winning on branded searches but losing organic market share to content-forward competitors.",
  },
  whyWhyAnalysis: [
    {
      dimension: "SEO",
      score: 68,
      levels: [
        { level: "L1", label: "Symptom", content: "Organic traffic share is 24% vs. competitor average of 41%" },
        { level: "L2", label: "Underlying Cause", content: "Content production is 1 post/month vs. required 8-12, topical clusters are incomplete" },
        { level: "L3", label: "Root Cause + Action", content: "No dedicated content strategist and no editorial calendar in place. Fix: hire/contract a content writer on retainer, create a 90-day keyword cluster plan targeting 'ashwagandha for sleep', 'adaptogens for anxiety' and 10 adjacent topics." },
      ],
    },
  ],
  recommendations: [
    {
      title: "Launch a 3-touch SMS win-back sequence for churned subscribers",
      predictedImpact: "+12-18% churned subscriber recovery",
      impactReasoning: "SMS win-back for subscription brands in Wellness recovers 12-18% of churned customers at 8-12x ROAS. Your existing email win-back is a single touch, SMS adds a new high-open-rate channel.",
      ice: { impact: 9, confidence: 8, ease: 7 },
      difficulty: "Easy",
      whyWeSaidThis: "You have 38% subscription revenue, a single-email win-back, and no SMS channel. This is the highest ROI retention fix with the lowest implementation effort.",
      implementationTemplate: "**Day 0 (Churn trigger):** 'Hey [Name], your Wellbeing Co. subscription paused. Still dealing with [original problem]? Here's 15% to restart today: [link]'\n\n**Day 7:** 'Quick check-in: [Name], 3 of your wellness goals from your first order. Have you tracked progress? Your subscription keeps the streak alive: [link]'\n\n**Day 21:** 'Last chance, your saved formula expires in 48 hours. Restart at your original price before it's gone: [link]'",
      done: false,
      saved: false,
    },
    {
      title: "Build a 90-day Ayurveda content cluster for SEO authority",
      predictedImpact: "+35-50% organic sessions in 6 months",
      impactReasoning: "Competitors publishing 10+ posts/month are ranking for informational keywords that funnel directly to product pages. A topical cluster strategy can capture an estimated 15,000-25,000 additional monthly organic visitors.",
      ice: { impact: 8, confidence: 7, ease: 5 },
      difficulty: "Medium",
      whyWeSaidThis: "SEO is your weakest dimension at 68. Organic traffic share is 24% vs. 41% for leading competitors. One content writer plus an editorial calendar is the asset with the longest compounding return.",
      implementationTemplate: "**Week 1-2:** Keyword research. Target clusters: Ashwagandha (12 articles), Sleep & Anxiety (8 articles), Immunity Adaptogens (10 articles).\n\n**Week 3-4:** Brief 4 cornerstone articles (2,000+ words each) for each cluster.\n\n**Month 2-3:** Publish 3 articles/week, each internally linking to the relevant product page.\n\n**Month 3:** Conduct outreach to 10 Ayurveda/wellness bloggers for backlink placements.",
      done: false,
      saved: false,
    },
    {
      title: "Add sticky add-to-cart bar and CTA above fold on top 3 PDPs",
      predictedImpact: "+8-14% PDP-to-cart conversion rate",
      impactReasoning: "PDP-to-cart is your primary funnel leak at 4.2% vs. 6-8% benchmark. A sticky ATC bar alone typically delivers +8-12% lift in category tests. This is a one-day development task.",
      ice: { impact: 8, confidence: 9, ease: 9 },
      difficulty: "Easy",
      whyWeSaidThis: "Your CTA is below the fold on mobile for your 3 highest-traffic SKUs. At estimated 50,000 monthly PDP visitors, even a 2% conversion improvement = 1,000 additional add-to-carts per month.",
      implementationTemplate: "**Step 1:** Move the price + ATC button section above the first image fold on mobile.\n\n**Step 2:** Implement a sticky bottom bar that appears after user scrolls past the hero, contains: product name, star rating, price, ATC button.\n\n**Step 3:** A/B test for 2 weeks with 50/50 traffic split. Primary metric: add-to-cart rate. Secondary: time-on-page.",
      done: false,
      saved: false,
    },
  ],
  competitorBenchmark: [
    { brand: "Wellbeing Co.", brandHealth: 82, pdp: 85, creative: 72, social: 88, funnel: 76, retention: 84, seo: 68, isAudited: true },
    { brand: "Kapiva", brandHealth: 74, pdp: 78, creative: 70, social: 76, funnel: 72, retention: 68, seo: 80 },
    { brand: "Setu Nutrition", brandHealth: 71, pdp: 75, creative: 68, social: 72, funnel: 70, retention: 74, seo: 65 },
    { brand: "Oziva", brandHealth: 78, pdp: 82, creative: 76, social: 80, funnel: 74, retention: 76, seo: 78 },
    { brand: "Fast&Up", brandHealth: 69, pdp: 72, creative: 74, social: 68, funnel: 66, retention: 62, seo: 72 },
  ],
  competitorTakeaway:
    "Wellbeing Co. leads the competitive set on Social and PDP, their content quality and trust infrastructure are best-in-class. The gap vs. Kapiva and Oziva in SEO is the primary growth threat if not addressed within 90 days.",
  upsellPriority: [
    { service: "SMS Marketing Setup", currentStatus: "Not active", priority: 1, pitchAngle: "38% subscription revenue with zero SMS retention, highest ROI unlock available today" },
    { service: "SEO Content Programme", currentStatus: "1 post/month", priority: 2, pitchAngle: "Competitors publishing 10x more content are taking your organic market share every week" },
    { service: "CRO / PDP Fixes", currentStatus: "ATC below fold on mobile", priority: 3, pitchAngle: "One-day development task recovers estimated 1,000 ATC/month, highest effort-to-revenue ratio on this list" },
    { service: "Referral Programme Amplification", currentStatus: "Exists, 8% awareness", priority: 4, pitchAngle: "You've built the engine but never turned the key, a promotion push costs nothing and acquires customers at ₹0 CAC" },
    { service: "Video Creative Production", currentStatus: "22% of ad mix", priority: 5, pitchAngle: "Reels and short-form video are 45% of category ad spend, your current 22% is leaving Reels reach on the table" },
    { service: "Homepage CRO Audit", currentStatus: "Too many equal CTAs", priority: 6, pitchAngle: "A clear hero journey for first-time visitors can lift homepage-to-PDP navigation by 20-30%" },
  ],
  status: "complete",
  createdAt: subDays(new Date(), 3),
  rubricVersion: "v1.0",
  modelVersion: "Llama 3.3 70B (Groq)",
};

// ─── Sample Audit 2: Beauty / Creative-strong, retention-weak (64) ────────────
export const sampleAudit2: Audit = {
  id: "sample-2",
  brandName: "Glow Ritual",
  brandUrl: "https://glowritual.in",
  metaAdLibraryUrl: "https://facebook.com/ads/library",
  instagramHandle: "@glowritual",
  category: "Beauty",
  competitorUrls: [],
  aboutBrand:
    "Glow Ritual is a Gen-Z focused Indian skincare brand that launched in 2021 with a hero 3-step Korean-inspired routine. Known for their highly shareable packaging and viral Reels campaigns, they have built an Instagram following of 285K with exceptional creative output. However, the business struggles with post-purchase retention, most customers buy once and don't return, and the brand has no loyalty programme, email sequences longer than 2 touches, or SMS channel. Revenue is estimated at ₹8–12 Cr with CAC increasing 40% YoY as organic growth plateaus.",
  brandHealthScore: 64,
  executiveSummary:
    "Glow Ritual has the top-of-funnel anyone would envy, viral creative, engaged community, and strong brand recall. The hole in the bucket is retention: without email flows, loyalty mechanics, or a subscription path, they're burning acquisition budget refilling a leaky bucket.",
  strategicOneLiner:
    "World-class top of funnel, broken bottom, their creative engine is running at full speed but landing in a retention desert. Build a 90-day lifecycle programme before doubling ad spend.",
  pdp: {
    score: 62,
    subMetrics: [
      { name: "Hero Image Quality", score: 85, benchmark: 75 },
      { name: "Copy Clarity", score: 60, benchmark: 70 },
      { name: "Social Proof Density", score: 52, benchmark: 65 },
      { name: "CTA Prominence", score: 58, benchmark: 72 },
      { name: "Trust Signals", score: 48, benchmark: 68 },
      { name: "Mobile UX", score: 70, benchmark: 71 },
    ],
    whatsWorking: [
      "Hero product photography is stunning, lifestyle shots optimised for mobile first-impression.",
      "Ingredient storytelling in copy uses Gen-Z language that resonates with their core demographic.",
      "Mobile page speed is 92/100, fast load reduces bounce for their mobile-dominant traffic.",
    ],
    criticalGaps: [
      "Only 18 reviews across top SKUs, social proof is dangerously thin for a trust-building category.",
      "No 'how to use' section on PDP, skincare customers need this to reduce returns and build confidence.",
      "Trust signals absent: no dermatologist endorsement, no certification badges, no ingredient safety claims.",
    ],
    whyThisScore: "PDPs score 62 because the visual execution is excellent but the purchase-confidence infrastructure, reviews, trust signals, usage guides, is minimal. For a skincare brand, missing dermatologist trust signals is a critical conversion gap.",
  },
  creative: {
    score: 91,
    subMetrics: [
      { name: "Image-to-Video Ratio", score: 88, benchmark: 65 },
      { name: "Active Ad Count", score: 92, benchmark: 60 },
      { name: "Creative Refresh Rate", score: 95, benchmark: 58 },
      { name: "Hook Diversity", score: 90, benchmark: 62 },
      { name: "UGC Integration", score: 94, benchmark: 55 },
      { name: "Brand Consistency", score: 86, benchmark: 74 },
    ],
    whatsWorking: [
      "Video ads at 65% of creative mix with average hook retention above 75% at 3 seconds, industry-leading.",
      "Weekly creative testing cadence with documented winner-loser framework, best practice execution.",
      "Native UGC with 40+ active creator partners creates authentic variety at low production cost.",
    ],
    criticalGaps: [
      "No performance creative connecting top-of-funnel brand awareness to bottom-of-funnel product conversion.",
      "Creative testing lacks a systematic seasonal dimension, missing Diwali, Valentine's, summer skin trend hooks.",
      "Competitor comparative ads are absent despite clear superiority in ingredient transparency.",
    ],
    whyThisScore: "Creative scores 91, it's the brand's genuine superpower. Volume, refresh rate, UGC integration, and hook diversity are all top-decile. The minor gap is the absence of full-funnel performance creative bridging awareness to conversion.",
  },
  social: {
    score: 82,
    subMetrics: [
      { name: "Follower Count", score: 88, benchmark: 70 },
      { name: "Post Frequency", score: 90, benchmark: 65 },
      { name: "Reels Ratio", score: 92, benchmark: 60 },
      { name: "Avg. Engagement Rate", score: 86, benchmark: 55 },
      { name: "UGC Volume", score: 78, benchmark: 58 },
      { name: "Community Response Rate", score: 58, benchmark: 62 },
    ],
    whatsWorking: [
      "285K followers with 5.2% engagement rate is well above the Beauty category average of 3.1%.",
      "Reels account for 70% of posts, correctly prioritising the highest-reach format.",
      "Trending audio usage within 24 hours of a trend surfacing, shows a reactive content team.",
    ],
    criticalGaps: [
      "Community response rate is below benchmark, DM and comment reply lag undermines community trust.",
      "No social listening programme, missing brand mention opportunities and competitor gaps.",
      "Instagram Shop integration is incomplete, only 30% of products tagged in shoppable posts.",
    ],
    whyThisScore: "Social scores 82 because content creation is excellent and reach metrics are strong, but the community management layer is under-invested. Response lag and incomplete Shop integration are leaving conversion on the table.",
  },
  funnel: {
    score: 58,
    subMetrics: [
      { name: "Awareness to Landing", score: 78, benchmark: 68 },
      { name: "Landing to PDP", score: 65, benchmark: 65 },
      { name: "PDP to Cart", score: 42, benchmark: 62 },
      { name: "Cart to Checkout", score: 60, benchmark: 70 },
      { name: "Checkout Completion", score: 55, benchmark: 66 },
      { name: "Persona Mapping", score: 48, benchmark: 60 },
    ],
    whatsWorking: [
      "Ad-to-landing-page relevance is high, creative messaging matches landing page, reducing early bounce.",
      "Product bundling recommendation at cart page is increasing AOV by an estimated 18%.",
      "Fast checkout via Shop Pay reduces checkout friction for returning customers.",
    ],
    criticalGaps: [
      "PDP-to-cart conversion at 2.8% is 60% below category benchmark, critically low for a beauty brand.",
      "Cart abandonment rate at 78% vs. 65% category norm, no rescue mechanism in place.",
      "Checkout requires email, no guest checkout option despite 40%+ first-time visitor rate.",
    ],
    whyThisScore: "Funnel scores 58 because despite good awareness-stage performance, the mid-funnel conversion is breaking down at PDP and Cart. The cart abandonment recovery gap alone represents an estimated ₹2.5 Cr in annual recoverable revenue.",
  },
  retention: {
    score: 28,
    subMetrics: [
      { name: "Email Capture Rate", score: 40, benchmark: 65 },
      { name: "Subscription Rate", score: 15, benchmark: 55 },
      { name: "Post-Purchase Flow", score: 22, benchmark: 60 },
      { name: "Loyalty Programme", score: 10, benchmark: 52 },
      { name: "Referral Mechanism", score: 30, benchmark: 48 },
      { name: "Repeat Purchase Rate", score: 25, benchmark: 62 },
    ],
    whatsWorking: [
      "Order confirmation email exists with an upsell block, basic foundation is in place.",
      "Instagram follower growth is acting as a proxy retention mechanism, keeping the brand in feed.",
      "Discount-based retargeting ads are recovering some abandoned cart sessions via paid channels.",
    ],
    criticalGaps: [
      "No email welcome series, first-time buyers receive zero educational content post-purchase.",
      "No loyalty programme whatsoever, every repeat purchase is earned at the same CAC as acquisition.",
      "Post-purchase email flow is a single order confirmation, no replenishment reminder, no review request, no cross-sell.",
    ],
    whyThisScore: "Retention scores 28, it's the brand's critical weakness and the primary reason CLV is suppressed. With estimated 12% repeat purchase rate vs. 38% category average, the brand is paying full acquisition cost for customers it has already won.",
  },
  seo: {
    score: 52,
    subMetrics: [
      { name: "Organic Traffic Share", score: 48, benchmark: 55 },
      { name: "Blog Presence", score: 35, benchmark: 58 },
      { name: "On-Page Optimisation", score: 58, benchmark: 66 },
      { name: "Core Web Vitals", score: 72, benchmark: 70 },
      { name: "Backlink Profile", score: 45, benchmark: 60 },
      { name: "Category Keywords", score: 42, benchmark: 62 },
    ],
    whatsWorking: [
      "Core Web Vitals are healthy, fast site speed is a good SEO foundation.",
      "Product names include primary keywords in URL slugs, basic on-page hygiene is present.",
      "Alt text on product images is partially implemented, improves image search discoverability.",
    ],
    criticalGaps: [
      "No blog or content section, missing all informational intent traffic for 'niacinamide serum', 'glass skin routine India'.",
      "Domain authority of 18 vs. competitor average of 32, thin backlink profile limits ranking potential.",
      "Category pages lack H1/H2 structure and descriptive copy, invisible to Google for non-brand queries.",
    ],
    whyThisScore: "SEO scores 52 because while technical basics are acceptable, content strategy is completely absent. This brand is 100% dependent on paid traffic with zero organic diversification, a structural risk as paid CPMs continue to rise.",
  },
  whyWhyAnalysis: [
    {
      dimension: "Retention",
      score: 28,
      levels: [
        { level: "L1", label: "Symptom", content: "12% repeat purchase rate vs. 38% category average, losing 2 in 3 customers after first purchase" },
        { level: "L2", label: "Underlying Cause", content: "No post-purchase nurture journey, zero email series, no loyalty incentive, no replenishment trigger" },
        { level: "L3", label: "Root Cause + Action", content: "Growth team has been 100% focused on acquisition metrics (ROAS, CPM) with no retention KPIs set. Fix: assign a CRM owner, set a 90-day target of 22% repeat rate, launch a 5-email welcome + replenishment series in Klaviyo within 3 weeks." },
      ],
    },
    {
      dimension: "Funnel",
      score: 58,
      levels: [
        { level: "L1", label: "Symptom", content: "PDP-to-cart at 2.8% and cart abandonment at 78%, funnel is leaking at two consecutive nodes" },
        { level: "L2", label: "Underlying Cause", content: "Social proof is thin (18 reviews), no trust signals, and no cart abandonment rescue mechanism" },
        { level: "L3", label: "Root Cause + Action", content: "Product team built beautiful PDPs without a conversion lens. Fix: run a 2-week CRO sprint, add reviews widget with 100-review target, add dermatologist quote badge, implement Klaviyo cart abandonment flow with 3-touch sequence." },
      ],
    },
  ],
  recommendations: [
    {
      title: "Build a 5-touch post-purchase email series in Klaviyo",
      predictedImpact: "+20-30% repeat purchase rate in 90 days",
      impactReasoning: "Beauty brands that implement a structured post-purchase nurture sequence see 20-30% repeat purchase improvement in the first 90 days. Your current single order confirmation is leaving this entire channel empty.",
      ice: { impact: 10, confidence: 9, ease: 8 },
      difficulty: "Easy",
      whyWeSaidThis: "Retention at 28 is your single biggest brand-health drag. A 5-email sequence is the highest-impact, lowest-cost growth action available to you right now.",
      implementationTemplate: "**Email 1 (Day 0):** Order confirmation + 'Your skin journey starts now' onboarding.\n\n**Email 2 (Day 3):** 'How to get the most from your Glow Ritual routine', educational content + review request.\n\n**Email 3 (Day 14):** '2 weeks in, are you seeing results?', testimonial social proof + replenishment teaser.\n\n**Email 4 (Day 30):** 'Your skin's next level', introduce complementary product based on first purchase.\n\n**Email 5 (Day 45):** 'Time to restock?', replenishment email with 10% loyalty discount.",
      done: false,
      saved: false,
    },
    {
      title: "Collect and display 100 reviews across top 5 SKUs in 30 days",
      predictedImpact: "+15-22% PDP conversion rate",
      impactReasoning: "PDP conversion at 2.8% is driven partly by thin social proof. Beauty category data shows 100+ reviews per SKU drives 15-22% higher add-to-cart rates. Your creative is driving traffic but trust is not converting it.",
      ice: { impact: 9, confidence: 8, ease: 7 },
      difficulty: "Easy",
      whyWeSaidThis: "You have 285K followers but only 18 reviews, a structural credibility mismatch. Your existing customers need an ask and an incentive.",
      implementationTemplate: "**Week 1:** Send a 'Share your Glow Story' email to all past customers with 200-point loyalty reward for photo review.\n\n**Week 2:** DM campaign to Instagram followers who have tagged the brand asking for Trustpilot review.\n\n**Week 3-4:** Add in-app post-purchase review request on Day 14 for all new orders.\n\nTarget: 20 reviews/SKU across top 5 SKUs in 30 days.",
      done: false,
      saved: false,
    },
    {
      title: "Launch 3-touch cart abandonment flow with 15% first-rescue offer",
      predictedImpact: "+12-18% cart recovery rate",
      impactReasoning: "Cart abandonment at 78% is 13 points above category average. A 3-touch recovery sequence (email + push + SMS) at 15% discount recovers 12-18% of abandoned carts in Beauty. At your estimated cart volume, this is ₹80-120L annually.",
      ice: { impact: 8, confidence: 9, ease: 8 },
      difficulty: "Easy",
      whyWeSaidThis: "No cart abandonment recovery mechanism is in place. This is the most common and costly gap for high-traffic, low-conversion DTC brands.",
      implementationTemplate: "**Touch 1 (1 hour post-abandon):** 'Did something come up? Your Glow Ritual cart is waiting.', no discount.\n\n**Touch 2 (24 hours):** 'Your skin won't wait forever, 15% off if you complete today.', primary discount offer.\n\n**Touch 3 (72 hours):** 'Last chance, your cart expires in 24 hours.', urgency + same discount.",
      done: false,
      saved: false,
    },
  ],
  competitorBenchmark: [
    { brand: "Glow Ritual", brandHealth: 64, pdp: 62, creative: 91, social: 82, funnel: 58, retention: 28, seo: 52, isAudited: true },
    { brand: "Minimalist", brandHealth: 78, pdp: 82, creative: 74, social: 78, funnel: 76, retention: 80, seo: 76 },
    { brand: "Plum Goodness", brandHealth: 72, pdp: 76, creative: 70, social: 74, funnel: 70, retention: 72, seo: 70 },
    { brand: "Dot & Key", brandHealth: 75, pdp: 80, creative: 78, social: 80, funnel: 72, retention: 68, seo: 64 },
    { brand: "Foxtale", brandHealth: 68, pdp: 72, creative: 82, social: 76, funnel: 62, retention: 58, seo: 56 },
  ],
  competitorTakeaway:
    "Glow Ritual's creative output is genuinely best-in-class against the competitive set, they outperform even Minimalist on creative. The retention gap vs. Minimalist (28 vs. 80) is the singular structural weakness and the primary reason their overall score lags by 14 points.",
  upsellPriority: [
    { service: "CRM / Klaviyo Post-Purchase Setup", currentStatus: "Single order confirmation only", priority: 1, pitchAngle: "You're paying full CAC for customers you've already won, a 5-email series costs ₹15K to build and returns 20-30% repeat rate" },
    { service: "Review Generation Campaign", currentStatus: "18 reviews total", priority: 2, pitchAngle: "285K followers and 18 reviews is a credibility crisis, one week of effort closes this gap" },
    { service: "Cart Abandonment Recovery", currentStatus: "No flow in place", priority: 3, pitchAngle: "78% cart abandonment with no recovery mechanism, estimated ₹80-120L recoverable annually" },
    { service: "PDP Trust Signals", currentStatus: "No dermatologist badge / certifications", priority: 4, pitchAngle: "Beauty buyers need expert validation before purchase, absence of trust signals is suppressing your PDP CVR" },
    { service: "SEO Content Programme", currentStatus: "No blog, no content", priority: 5, pitchAngle: "100% paid dependency is unsustainable as CPMs rise, organic content is the long-term insurance policy" },
    { service: "Instagram Shop Completion", currentStatus: "30% products tagged", priority: 6, pitchAngle: "Shoppable posts drive 2-3x higher CTR vs. link-in-bio for fashion/beauty, complete the integration" },
  ],
  status: "complete",
  createdAt: subDays(new Date(), 8),
  rubricVersion: "v1.0",
  modelVersion: "Llama 3.3 70B (Groq)",
};

// ─── Sample Audit 3: Fashion / SEO-led, weak ads (58) ─────────────────────────
export const sampleAudit3: Audit = {
  id: "sample-3",
  brandName: "Label Indie",
  brandUrl: "https://labelindie.com",
  metaAdLibraryUrl: "https://facebook.com/ads/library",
  instagramHandle: "@labelindie",
  category: "Fashion",
  competitorUrls: [],
  aboutBrand:
    "Label Indie is a Jaipur-based independent fashion brand specializing in hand-block-printed ethnic contemporary wear. Founded in 2018 by a NIFT graduate, the brand has built remarkable organic discoverability through consistent blogging about craft, sustainability, and artisan stories. Their organic search traffic accounts for 58% of all website sessions, an extraordinary achievement in a category dominated by paid-first players. However, their Meta ad account has fewer than 10 active creatives and has not been refreshed in 8 weeks, creating a severe reach cap just as organic growth is plateauing.",
  brandHealthScore: 58,
  executiveSummary:
    "Label Indie has built a rare organic moat in Indian fashion, their SEO and content strategy is category-leading. The growth ceiling is a completely underdeveloped paid channel: 8 stale ads and no video creative mean they cannot scale beyond their organic ceiling.",
  strategicOneLiner:
    "A world-class SEO engine attached to a broken paid acquisition machine, their organic traffic is a gift they're not monetising. Build a paid creative programme to match the content quality that already exists.",
  pdp: {
    score: 70,
    subMetrics: [
      { name: "Hero Image Quality", score: 78, benchmark: 75 },
      { name: "Copy Clarity", score: 72, benchmark: 70 },
      { name: "Social Proof Density", score: 65, benchmark: 65 },
      { name: "CTA Prominence", score: 68, benchmark: 72 },
      { name: "Trust Signals", score: 74, benchmark: 68 },
      { name: "Mobile UX", score: 62, benchmark: 71 },
    ],
    whatsWorking: [
      "Story-led product descriptions that explain the artisan and craft behind each piece, differentiated and trust-building.",
      "Size guide with body measurement chart reduces return rate for ethnic wear.",
      "Fabric and care instructions detailed, reduces post-purchase dissatisfaction.",
    ],
    criticalGaps: [
      "Mobile UX is the weakest link, images load slowly on 4G and the size selector is too small for thumbs.",
      "No 360-degree or video view of garments despite high-value products where detail matters.",
      "CTA button is a pale pink that doesn't contrast sufficiently with white background, accessibility fail.",
    ],
    whyThisScore: "PDPs score 70 because the storytelling is excellent but the conversion UX on mobile is creating friction at exactly the point where 72% of traffic arrives.",
  },
  creative: {
    score: 28,
    subMetrics: [
      { name: "Image-to-Video Ratio", score: 20, benchmark: 65 },
      { name: "Active Ad Count", score: 22, benchmark: 60 },
      { name: "Creative Refresh Rate", score: 15, benchmark: 58 },
      { name: "Hook Diversity", score: 30, benchmark: 62 },
      { name: "UGC Integration", score: 35, benchmark: 55 },
      { name: "Brand Consistency", score: 65, benchmark: 74 },
    ],
    whatsWorking: [
      "The 6 static brand ads that exist have high visual quality, product photography is excellent.",
      "Brand voice in ad copy is consistent with the organic content identity.",
      "One UGC-style Reel from a creator partner is the top-performing creative by a wide margin.",
    ],
    criticalGaps: [
      "Only 8 active ads total with the most recent creative over 8 weeks old, severe creative fatigue.",
      "Zero video ads despite Instagram and Facebook heavily favouring video in algorithm distribution.",
      "No seasonal or collection-drop creatives, 4 major collection launches missed in the past 6 months.",
    ],
    whyThisScore: "Creative scores 28, the brand's critical failure. With 8 stale static ads and no video, they are functionally invisible in the paid channel despite having exceptional organic content to draw from.",
  },
  social: {
    score: 74,
    subMetrics: [
      { name: "Follower Count", score: 72, benchmark: 70 },
      { name: "Post Frequency", score: 80, benchmark: 65 },
      { name: "Reels Ratio", score: 62, benchmark: 60 },
      { name: "Avg. Engagement Rate", score: 78, benchmark: 55 },
      { name: "UGC Volume", score: 70, benchmark: 58 },
      { name: "Community Response Rate", score: 80, benchmark: 62 },
    ],
    whatsWorking: [
      "Artisan-story Reels averaging 45K views, authentic craft content drives above-benchmark engagement.",
      "Strong community response rate, founder personally replies to comments, creating loyalty.",
      "Regular user-submitted styling photos with community hashtag.",
    ],
    criticalGaps: [
      "Reels ratio at 62% when benchmark is moving to 70%+, need to increase video-first content.",
      "No Instagram Shopping strategy, product tags in only 20% of posts.",
      "Collaborations with larger fashion creators absent, organic reach ceiling is becoming a constraint.",
    ],
    whyThisScore: "Social scores 74, authentic content and community health are strong. The gap is in amplification: without creator collaborations and complete Shop integration, organic reach is self-limiting.",
  },
  funnel: {
    score: 60,
    subMetrics: [
      { name: "Awareness to Landing", score: 72, benchmark: 68 },
      { name: "Landing to PDP", score: 68, benchmark: 65 },
      { name: "PDP to Cart", score: 52, benchmark: 62 },
      { name: "Cart to Checkout", score: 62, benchmark: 70 },
      { name: "Checkout Completion", score: 56, benchmark: 66 },
      { name: "Persona Mapping", score: 48, benchmark: 60 },
    ],
    whatsWorking: [
      "Organic blog traffic lands on highly relevant collection pages, high intent, lower drop-off.",
      "Wishlist feature is actively used, captures consideration-stage intent.",
      "Free shipping threshold at ₹1,299 is well-calibrated to AOV.",
    ],
    criticalGaps: [
      "No persona mapping, targeting the same messaging to first-time visitors and repeat buyers.",
      "Checkout requires account creation, 35% of first-time visitors abandon at this step.",
      "No upsell at cart stage despite high styling occasion overlap between products.",
    ],
    whyThisScore: "Funnel scores 60 because the organic traffic quality is high but checkout friction and lack of persona-based messaging are preventing full conversion.",
  },
  retention: {
    score: 62,
    subMetrics: [
      { name: "Email Capture Rate", score: 68, benchmark: 65 },
      { name: "Subscription Rate", score: 42, benchmark: 55 },
      { name: "Post-Purchase Flow", score: 65, benchmark: 60 },
      { name: "Loyalty Programme", score: 58, benchmark: 52 },
      { name: "Referral Mechanism", score: 55, benchmark: 48 },
      { name: "Repeat Purchase Rate", score: 62, benchmark: 62 },
    ],
    whatsWorking: [
      "Email newsletter with craft and artisan stories has 38% open rate, above-benchmark engaged list.",
      "Birthday discount programme drives measurable repeat purchases.",
      "WhatsApp broadcast for new collection drops shows high engagement.",
    ],
    criticalGaps: [
      "Post-purchase series is only 2 touches, no educational or styling content to build product love.",
      "No replenishment or 'complete the look' trigger based on purchase history.",
      "Loyalty programme has no tiered structure, same reward regardless of purchase frequency.",
    ],
    whyThisScore: "Retention scores 62, above average in the competitive set but below potential. The email newsletter is a strong asset that is under-leveraged as a conversion and retention driver.",
  },
  seo: {
    score: 88,
    subMetrics: [
      { name: "Organic Traffic Share", score: 92, benchmark: 55 },
      { name: "Blog Presence", score: 95, benchmark: 58 },
      { name: "On-Page Optimisation", score: 86, benchmark: 66 },
      { name: "Core Web Vitals", score: 82, benchmark: 70 },
      { name: "Backlink Profile", score: 78, benchmark: 60 },
      { name: "Category Keywords", score: 88, benchmark: 62 },
    ],
    whatsWorking: [
      "58% of traffic from organic search is extraordinary, typically 18-22% for this category.",
      "Blog with 120+ articles on block print craft, styling guides, and artisan stories drives sustained topical authority.",
      "Ranking for 'block print kurta', 'Jaipur ethnic wear online' and 8 other category keywords in positions 3-8.",
    ],
    criticalGaps: [
      "Blog content is not systematically linked to product collection pages, leaving conversion on the table.",
      "No local SEO presence despite Jaipur origin story, missing 'Jaipur fashion brand' searches.",
      "Image SEO for fashion is sub-optimal, alt text missing on 30% of product images.",
    ],
    whyThisScore: "SEO scores 88, this is the brand's crown jewel. Their content investment has built a domain authority that competitors paying ₹50L/month in ads cannot replicate. The small gap is connecting this traffic more effectively to product pages.",
  },
  whyWhyAnalysis: [
    {
      dimension: "Creative",
      score: 28,
      levels: [
        { level: "L1", label: "Symptom", content: "8 active ads, 8 weeks old, zero video, paid channel contributes only 18% of revenue vs. 45% category average" },
        { level: "L2", label: "Underlying Cause", content: "No paid marketing hire, founder is creating all content and has prioritised organic/blog over paid creative" },
        { level: "L3", label: "Root Cause + Action", content: "Single-person creative bottleneck with no paid-specific content calendar. Fix: hire a freelance performance creative director for ₹25-40K/month, assign them to repurpose existing blog and organic content into 15 ad creatives in 30 days." },
      ],
    },
  ],
  recommendations: [
    {
      title: "Repurpose top 10 blog posts into 30 paid ad creatives",
      predictedImpact: "+150-200% paid channel revenue in 60 days",
      impactReasoning: "You have 120 pieces of proven organic content, your blog posts and artisan stories have demonstrated audience resonance. Repurposing these into video ads and carousels leverages existing assets at 10% the cost of new production.",
      ice: { impact: 9, confidence: 8, ease: 8 },
      difficulty: "Easy",
      whyWeSaidThis: "With creative at 28 and SEO at 88, you have the content, just not the ad formats. The fastest paid scaling path is repurposing rather than creating from scratch.",
      implementationTemplate: "**Week 1:** Identify top 10 blog posts by organic traffic + engagement. Brief a video editor to create 30-second vertical videos from each.\n\n**Week 2:** Create 3 carousel ad variants per blog post highlighting 3 artisan facts.\n\n**Week 3:** Launch 20 ads across Meta with ₹5K/day testing budget, 10 video, 10 carousel.\n\n**Week 4:** Consolidate winning formats and scale to ₹20K/day.",
      done: false,
      saved: false,
    },
    {
      title: "Add internal links from blog articles to product collection pages",
      predictedImpact: "+25-35% blog-to-product navigation",
      impactReasoning: "Your blog drives 58% of all traffic but product collection pages are getting less than 15% of blog referral traffic. Systematic internal linking can redirect 25-35% of blog readers to relevant product pages.",
      ice: { impact: 7, confidence: 9, ease: 9 },
      difficulty: "Easy",
      whyWeSaidThis: "This is a 2-day task that connects your biggest asset (SEO traffic) to your conversion funnel. It requires no new content, just editing existing articles.",
      implementationTemplate: "**Step 1:** Audit top 30 blog articles by traffic. Identify the most relevant product collection for each.\n\n**Step 2:** Add 2-3 contextual product links per article with 'Shop this look' or 'Explore the [X] collection'.\n\n**Step 3:** Add a 'Explore related products' widget at the end of each blog post.\n\n**Step 4:** Track blog referral rate to collection pages, target 25% of blog readers clicking to a product page.",
      done: false,
      saved: false,
    },
    {
      title: "Enable guest checkout to reduce first-purchase friction",
      predictedImpact: "+15-20% checkout completion rate",
      impactReasoning: "35% of first-time visitors abandon at the account creation step. Guest checkout in apparel typically recovers 15-20% of this cohort. This is a platform configuration change, not a development task.",
      ice: { impact: 7, confidence: 9, ease: 10 },
      difficulty: "Easy",
      whyWeSaidThis: "Checkout requires account creation which is a best-practices violation for a brand with significant first-time organic traffic. This single setting change can recover hundreds of orders per month.",
      implementationTemplate: "**Step 1:** Enable Shopify/WooCommerce guest checkout in platform settings.\n\n**Step 2:** After guest checkout, present 'Create an account to track your order and earn loyalty points', convert guests post-purchase with incentive.\n\n**Step 3:** Monitor checkout completion rate for 2 weeks. Expected lift: 15-20%.",
      done: false,
      saved: false,
    },
  ],
  competitorBenchmark: [
    { brand: "Label Indie", brandHealth: 58, pdp: 70, creative: 28, social: 74, funnel: 60, retention: 62, seo: 88, isAudited: true },
    { brand: "Aks Clothing", brandHealth: 65, pdp: 68, creative: 70, social: 66, funnel: 62, retention: 58, seo: 62 },
    { brand: "SUTA", brandHealth: 72, pdp: 74, creative: 76, social: 78, funnel: 68, retention: 66, seo: 74 },
    { brand: "Kilmora", brandHealth: 60, pdp: 65, creative: 62, social: 64, funnel: 56, retention: 55, seo: 78 },
    { brand: "Jaypore", brandHealth: 70, pdp: 72, creative: 66, social: 70, funnel: 68, retention: 68, seo: 72 },
  ],
  competitorTakeaway:
    "Label Indie's SEO score is the highest in the competitive set by a significant margin, this is a genuine moat. Their total brand health lags because creative is an outlier low. Addressing paid creative alone would bring them to a top-2 position in 60 days.",
  upsellPriority: [
    { service: "Performance Creative Programme", currentStatus: "8 stale ads, no video", priority: 1, pitchAngle: "You have 120 pieces of organic content and zero paid leverage on them, this is the fastest revenue unlock in your entire business" },
    { service: "Blog-to-Product Internal Linking", currentStatus: "Minimal cross-linking", priority: 2, pitchAngle: "2-day task that turns your biggest asset (58% organic traffic) into a conversion machine" },
    { service: "Guest Checkout Enablement", currentStatus: "Forced account creation", priority: 3, pitchAngle: "One platform setting change that recovers 15-20% of checkout abandonment from first-time visitors" },
    { service: "Mobile PDP UX Fix", currentStatus: "Slow images, small CTA on mobile", priority: 4, pitchAngle: "72% of traffic is mobile, page speed and CTA sizing are costing you conversions on every session" },
    { service: "Instagram Shop Completion", currentStatus: "20% products tagged", priority: 5, pitchAngle: "80% of your organic fashion content is not shoppable, completing tags takes 2 hours and unlocks direct purchase intent" },
    { service: "Creator Collaboration Programme", currentStatus: "None active", priority: 6, pitchAngle: "One collaboration with a 100K+ fashion creator generates equivalent reach to 3 months of your current organic growth" },
  ],
  status: "complete",
  createdAt: subDays(new Date(), 14),
  rubricVersion: "v1.0",
  modelVersion: "Llama 3.3 70B (Groq)",
};

// ─── Sample Audit 4: F&B / Social-strong, PDP broken (55) ────────────────────
export const sampleAudit4: Audit = {
  id: "sample-4",
  brandName: "Crunch Culture",
  brandUrl: "https://crunchculture.in",
  metaAdLibraryUrl: "https://facebook.com/ads/library",
  instagramHandle: "@crunchculture",
  category: "F&B",
  competitorUrls: [],
  aboutBrand:
    "Crunch Culture is a Bengaluru-based healthy snacking brand that makes high-protein, low-sugar trail mixes and nut-based snacks. Launched in 2020, they have built a cult following of fitness enthusiasts and working professionals through meme-driven Instagram content and authentic founder storytelling. With 198K followers and 6.2% engagement rate, their social presence far outpaces their revenue conversion. The brand's DTC website suffers from outdated UX, confusing nutrition labelling, and checkout friction that is actively losing customers who've been acquired through strong organic content.",
  brandHealthScore: 55,
  executiveSummary:
    "Crunch Culture's social media is carrying the entire brand, community engagement, brand recall, and content quality are all strong. The hard truth is that their website would fail a basic UX audit, and they are converting only 1.1% of the traffic their social content earns.",
  strategicOneLiner:
    "A brilliant community builder with a broken storefront, their social content earns attention but the website fails to convert it. A focused 30-day CRO sprint on PDP and checkout would double their DTC revenue.",
  pdp: {
    score: 35,
    subMetrics: [
      { name: "Hero Image Quality", score: 45, benchmark: 75 },
      { name: "Copy Clarity", score: 38, benchmark: 70 },
      { name: "Social Proof Density", score: 28, benchmark: 65 },
      { name: "CTA Prominence", score: 32, benchmark: 72 },
      { name: "Trust Signals", score: 30, benchmark: 68 },
      { name: "Mobile UX", score: 38, benchmark: 71 },
    ],
    whatsWorking: [
      "Product flavour names are witty and on-brand, creates a memorable browse experience.",
      "Nutritional callouts (protein, calories) are present, meeting fitness audience expectations.",
      "The FAQ section is thorough, addressing freshness, delivery, and ingredients.",
    ],
    criticalGaps: [
      "Hero images are blurry on Retina displays, product looks unappealing vs. Instagram content.",
      "Copy leads with brand story, not product benefits, doesn't answer the buyer's first question ('why this vs. others?').",
      "Zero reviews on PDPs, an F&B brand with no social proof is a significant trust failure.",
    ],
    whyThisScore: "PDPs score 35, critically weak. The visual assets and copy that work so well on Instagram are entirely absent from the website. It's as if two different brands built the social and the PDP.",
  },
  creative: {
    score: 62,
    subMetrics: [
      { name: "Image-to-Video Ratio", score: 70, benchmark: 65 },
      { name: "Active Ad Count", score: 58, benchmark: 60 },
      { name: "Creative Refresh Rate", score: 65, benchmark: 58 },
      { name: "Hook Diversity", score: 68, benchmark: 62 },
      { name: "UGC Integration", score: 72, benchmark: 55 },
      { name: "Brand Consistency", score: 40, benchmark: 74 },
    ],
    whatsWorking: [
      "Meme-format ads achieve above-average engagement and shares for the F&B category.",
      "UGC gym and desk-snacking content is authentic and resonates with the fitness audience.",
      "Short video format (15-30 seconds) matches platform preference for snackable content.",
    ],
    criticalGaps: [
      "Brand consistency in paid ads is low, creative styles vary too widely, reducing brand recall.",
      "Ad copy is primarily humor-driven with no product differentiation messaging.",
      "No performance creative connecting social content to a specific product conversion goal.",
    ],
    whyThisScore: "Creative scores 62, the brand voice is engaging but ad creative doesn't have a conversion strategy. Humor works for organic but paid needs a direct product hook.",
  },
  social: {
    score: 88,
    subMetrics: [
      { name: "Follower Count", score: 85, benchmark: 70 },
      { name: "Post Frequency", score: 90, benchmark: 65 },
      { name: "Reels Ratio", score: 88, benchmark: 60 },
      { name: "Avg. Engagement Rate", score: 94, benchmark: 55 },
      { name: "UGC Volume", score: 88, benchmark: 58 },
      { name: "Community Response Rate", score: 84, benchmark: 62 },
    ],
    whatsWorking: [
      "6.2% engagement rate is extraordinary, top 5% for F&B category in India.",
      "Founder content with behind-the-scenes production stories drives 8x saves vs. product content.",
      "Active community challenges (#crunchit) generate authentic UGC weekly.",
    ],
    criticalGaps: [
      "Social content strategy is not connected to DTC sales funnel, no link-in-bio strategy.",
      "No Instagram Shop integration despite product category being highly impulse-purchase eligible.",
      "Absence of social proof transfer, reviews and testimonials from social never appear on website.",
    ],
    whyThisScore: "Social scores 88, it's the brand's genuine strength. Community health and content quality are exceptional. The gap is in converting this attention into DTC revenue.",
  },
  funnel: {
    score: 42,
    subMetrics: [
      { name: "Awareness to Landing", score: 65, benchmark: 68 },
      { name: "Landing to PDP", score: 52, benchmark: 65 },
      { name: "PDP to Cart", score: 28, benchmark: 62 },
      { name: "Cart to Checkout", score: 48, benchmark: 70 },
      { name: "Checkout Completion", score: 35, benchmark: 66 },
      { name: "Persona Mapping", score: 32, benchmark: 60 },
    ],
    whatsWorking: [
      "Bundle offers at the cart stage are achieving 14% uptake, above category average.",
      "Free delivery threshold is well-positioned relative to AOV.",
      "Social proof from Instagram sometimes embedded in retargeting ads.",
    ],
    criticalGaps: [
      "Homepage to PDP navigation requires 3-4 clicks, too many steps for impulse F&B category.",
      "Checkout is a 5-step process vs. industry standard 2-3 steps, significant abandonment at each step.",
      "Payment options lack BNPL (Buy Now Pay Later) despite average order value crossing ₹800.",
    ],
    whyThisScore: "Funnel scores 42, the conversion rate of 1.1% on a brand with 198K engaged followers is a critical failure signal. The website is structurally designed to lose customers.",
  },
  retention: {
    score: 48,
    subMetrics: [
      { name: "Email Capture Rate", score: 55, benchmark: 65 },
      { name: "Subscription Rate", score: 35, benchmark: 55 },
      { name: "Post-Purchase Flow", score: 45, benchmark: 60 },
      { name: "Loyalty Programme", score: 40, benchmark: 52 },
      { name: "Referral Mechanism", score: 42, benchmark: 48 },
      { name: "Repeat Purchase Rate", score: 52, benchmark: 62 },
    ],
    whatsWorking: [
      "WhatsApp broadcast for new flavour launches drives measurable immediate spikes in orders.",
      "Referral codes shared by community members organically via Instagram Stories.",
      "Reorder reminder email at Day 30 is capturing some repeat purchases.",
    ],
    criticalGaps: [
      "Email list is only 8,000 vs. 198K Instagram followers, massive capture gap.",
      "No subscription snack box offering despite monthly replenishment behaviour being natural for this category.",
      "Post-purchase flow has no 'share your snack' incentive despite UGC being a brand strength.",
    ],
    whyThisScore: "Retention scores 48 because the brand has not invested in converting their engaged social community into an owned CRM audience. 198K followers and 8,000 email subscribers is a channel concentration risk.",
  },
  seo: {
    score: 48,
    subMetrics: [
      { name: "Organic Traffic Share", score: 38, benchmark: 55 },
      { name: "Blog Presence", score: 40, benchmark: 58 },
      { name: "On-Page Optimisation", score: 55, benchmark: 66 },
      { name: "Core Web Vitals", score: 60, benchmark: 70 },
      { name: "Backlink Profile", score: 42, benchmark: 60 },
      { name: "Category Keywords", score: 45, benchmark: 62 },
    ],
    whatsWorking: [
      "Brand name search volume is growing, indicating positive brand recall from social.",
      "Recipe content on Instagram has SEO potential if converted to website blog format.",
      "Structured data is partially implemented, products show up in Google Shopping.",
    ],
    criticalGaps: [
      "Core Web Vitals fail on mobile, Largest Contentful Paint over 4.5 seconds on 4G connection.",
      "No blog, missing 'healthy snacks India', 'high protein snacks office' and other high-intent keywords.",
      "Product category pages have no descriptive content, invisible to Google for category searches.",
    ],
    whyThisScore: "SEO scores 48 because the brand is almost entirely invisible to non-brand organic searches. With a cult social following, they have earned brand authority that isn't being leveraged for SEO.",
  },
  whyWhyAnalysis: [
    {
      dimension: "PDP",
      score: 35,
      levels: [
        { level: "L1", label: "Symptom", content: "PDP-to-cart at 1.8% vs. 6% F&B category average, website is converting 70% fewer visitors than the benchmark" },
        { level: "L2", label: "Underlying Cause", content: "Product pages have blurry hero images, zero reviews, and copy that doesn't answer the primary buyer question" },
        { level: "L3", label: "Root Cause + Action", content: "The founding team's strength is in content creation and community, website UX has never had dedicated investment. Fix: spend ₹20K on a CRO audit and redesign of top 5 PDPs, collect 50 reviews via email campaign in 2 weeks, and reshoot product photography to match Instagram quality." },
      ],
    },
    {
      dimension: "Funnel",
      score: 42,
      levels: [
        { level: "L1", label: "Symptom", content: "Overall DTC conversion at 1.1%, 3x below F&B benchmark of 3-4%" },
        { level: "L2", label: "Underlying Cause", content: "5-step checkout, missing BNPL, and 3-click homepage-to-product journey are creating structural abandonment" },
        { level: "L3", label: "Root Cause + Action", content: "Platform migration to Shopify from a custom-built site is the root cause, checkout is non-standard. Fix: migrate to Shopify in 30 days, enable one-click checkout and Shop Pay, and reduce checkout steps to 2." },
      ],
    },
  ],
  recommendations: [
    {
      title: "Conduct a 30-day CRO sprint on top 5 PDPs",
      predictedImpact: "+80-120% DTC conversion rate",
      impactReasoning: "At 1.1% conversion rate and 198K social followers, even reaching the category average of 3% would represent a 170% revenue increase with zero additional ad spend. PDP quality is the single biggest lever.",
      ice: { impact: 10, confidence: 9, ease: 6 },
      difficulty: "Medium",
      whyWeSaidThis: "Your social following is an acquisition machine that's wasted on a broken website. Fixing the website is not optional, it's the prerequisite for every other growth action.",
      implementationTemplate: "**Week 1:** Reshoot hero images for top 5 SKUs with DSLR (same quality as Instagram). Write benefit-first copy: 'X grams of protein. Y calories. The snack that keeps you full till dinner.'\n\n**Week 2:** Email existing customers for reviews, target 10 reviews per SKU. Add verified badge.\n\n**Week 3:** Add trust signals: FSSAI badge, nutritionist endorsed, ingredient origin callout.\n\n**Week 4:** A/B test new vs. old PDP. Track add-to-cart rate.",
      done: false,
      saved: false,
    },
    {
      title: "Migrate checkout to Shopify and enable Shop Pay / BNPL",
      predictedImpact: "+40-60% checkout completion rate",
      impactReasoning: "Your custom 5-step checkout has an estimated 65% abandonment rate. Shopify's native checkout combined with Shop Pay for returning customers reduces checkout steps to 1-2 taps.",
      ice: { impact: 9, confidence: 8, ease: 4 },
      difficulty: "Hard",
      whyWeSaidThis: "The checkout is structurally broken, every other retention and funnel fix is limited by this constraint. Migration is the foundational fix.",
      implementationTemplate: "**Month 1:** Shopify migration planning, data export from current platform, theme selection.\n\n**Month 1-2:** Migration with product import, SEO redirect map, and checkout flow setup.\n\n**Post-launch:** Enable Shop Pay, Simpl BNPL, and UPI payment options. Set up abandoned checkout flows in Klaviyo.",
      done: false,
      saved: false,
    },
    {
      title: "Launch a 'Snack Box Subscription' to drive predictable revenue",
      predictedImpact: "+25-35% MoM revenue from subscription within 6 months",
      impactReasoning: "Monthly replenishment is natural for the healthy snacking category. A subscription snack box with community voting on flavours combines your strengths in community engagement with a recurring revenue model.",
      ice: { impact: 8, confidence: 7, ease: 5 },
      difficulty: "Medium",
      whyWeSaidThis: "F&B subscription penetration among loyal D2C communities is 15-30%. Your 6.2% engagement rate signals exactly the type of brand affinity that converts to subscription.",
      implementationTemplate: "**Week 1-2:** Design 'Crunch Club' subscription box, 4 SKUs, monthly delivery, community flavour vote.\n\n**Week 3:** Launch to existing customers with 20% first-box discount and 'founding member' badge.\n\n**Week 4:** Social launch campaign, 'What goes in this month's box?' community poll.\n\n**Month 2+:** Referral programme, 'Get 1 month free when a friend subscribes.'",
      done: false,
      saved: false,
    },
  ],
  competitorBenchmark: [
    { brand: "Crunch Culture", brandHealth: 55, pdp: 35, creative: 62, social: 88, funnel: 42, retention: 48, seo: 48, isAudited: true },
    { brand: "Yoga Bar", brandHealth: 76, pdp: 78, creative: 72, social: 74, funnel: 74, retention: 78, seo: 74 },
    { brand: "The Whole Truth", brandHealth: 80, pdp: 84, creative: 76, social: 82, funnel: 78, retention: 80, seo: 76 },
    { brand: "Slurrp Farm", brandHealth: 68, pdp: 70, creative: 66, social: 70, funnel: 66, retention: 62, seo: 68 },
    { brand: "Ketofy", brandHealth: 62, pdp: 65, creative: 68, social: 65, funnel: 58, retention: 55, seo: 60 },
  ],
  competitorTakeaway:
    "Crunch Culture's social score of 88 is best-in-class, they genuinely outperform Yoga Bar and The Whole Truth on community engagement. The gap to The Whole Truth's 80 overall vs. their 55 is explained entirely by PDP (35 vs. 84) and Funnel (42 vs. 78), both fixable in 60 days.",
  upsellPriority: [
    { service: "PDP CRO Sprint", currentStatus: "Blurry images, zero reviews", priority: 1, pitchAngle: "198K followers converting at 1.1%, fixing the website is the highest-leverage action in the business right now" },
    { service: "Shopify Migration + Checkout Fix", currentStatus: "Custom 5-step checkout", priority: 2, pitchAngle: "Every growth action is capped by a broken checkout, this is the infrastructure fix that unlocks everything else" },
    { service: "Email List Growth Programme", currentStatus: "8K emails vs. 198K followers", priority: 3, pitchAngle: "Instagram could disappear tomorrow, 8K emails is a fragile owned audience for a brand with this community strength" },
    { service: "Snack Box Subscription Launch", currentStatus: "No subscription offering", priority: 4, pitchAngle: "Monthly replenishment is a natural behaviour for your product, subscription locks in revenue and reduces CAC" },
    { service: "Performance Creative Programme", currentStatus: "Brand consistent ads missing", priority: 5, pitchAngle: "Meme content works for organic, paid needs a conversion hook to close the gap between awareness and purchase" },
    { service: "SEO & Core Web Vitals Fix", currentStatus: "4.5s LCP on mobile", priority: 6, pitchAngle: "Page speed failure is costing you Google rankings and user retention, fix is a 1-day developer task" },
  ],
  status: "complete",
  createdAt: subDays(new Date(), 21),
  rubricVersion: "v1.0",
  modelVersion: "Llama 3.3 70B (Groq)",
};

// ─── Sample Audit 5: Electronics / Below-average overall (38) ─────────────────
export const sampleAudit5: Audit = {
  id: "sample-5",
  brandName: "Voltiq",
  brandUrl: "https://voltiq.in",
  metaAdLibraryUrl: "https://facebook.com/ads/library",
  instagramHandle: "@voltiqindia",
  category: "Electronics",
  competitorUrls: [],
  aboutBrand:
    "Voltiq is a Noida-based consumer electronics brand that sells affordable portable chargers, smart cables, and laptop accessories primarily targeting college students and young professionals. Founded in 2021, they distribute primarily through Amazon and Flipkart, with a DTC website that was launched as an afterthought and never properly invested in. Revenue is estimated at ₹4-6 Cr, almost entirely from marketplace channels. The DTC website receives approximately 3,000 monthly visitors with a 0.6% conversion rate, a signal of severe funnel and trust infrastructure failures.",
  brandHealthScore: 38,
  executiveSummary:
    "Voltiq has product-market fit in the marketplace channel but has failed to build a DTC business. With a 0.6% DTC conversion rate, broken social presence, and no content strategy, the brand is entirely dependent on marketplace algorithms, a structural risk as competition and fees increase.",
  strategicOneLiner:
    "A viable marketplace business disguised as a DTC brand, without a website that earns trust, a social presence that builds consideration, and a content strategy that drives organic traffic, Voltiq is one algorithm change away from a revenue crisis.",
  pdp: {
    score: 32,
    subMetrics: [
      { name: "Hero Image Quality", score: 35, benchmark: 75 },
      { name: "Copy Clarity", score: 30, benchmark: 70 },
      { name: "Social Proof Density", score: 22, benchmark: 65 },
      { name: "CTA Prominence", score: 38, benchmark: 72 },
      { name: "Trust Signals", score: 28, benchmark: 68 },
      { name: "Mobile UX", score: 40, benchmark: 71 },
    ],
    whatsWorking: [
      "Technical specifications are accurate and complete, meets basic category requirement.",
      "Price-to-spec comparison is present, addressing the core electronics buyer objection.",
      "Product dimensions and weight listed, reduces returns for physical product category.",
    ],
    criticalGaps: [
      "Website product images are Amazon listing images, not optimised for a DTC context.",
      "Zero customer reviews on DTC website despite 400+ reviews on Amazon.",
      "No compatibility guide for different laptop/phone models, critical for accessories category.",
    ],
    whyThisScore: "PDPs score 32 because they are literally repurposed marketplace content. The brand has not invested in a DTC-specific content strategy.",
  },
  creative: {
    score: 25,
    subMetrics: [
      { name: "Image-to-Video Ratio", score: 20, benchmark: 65 },
      { name: "Active Ad Count", score: 22, benchmark: 60 },
      { name: "Creative Refresh Rate", score: 18, benchmark: 58 },
      { name: "Hook Diversity", score: 28, benchmark: 62 },
      { name: "UGC Integration", score: 30, benchmark: 55 },
      { name: "Brand Consistency", score: 32, benchmark: 74 },
    ],
    whatsWorking: [
      "2 UGC-style review videos from YouTube reviewers are the best-performing content.",
      "Product demonstration videos (when they exist) show technical features effectively.",
      "Price-point messaging in ads resonates with the student target audience.",
    ],
    criticalGaps: [
      "5 active ads total, all over 12 weeks old, creative is completely exhausted.",
      "No brand visual identity in ads, looks like a generic white-label product.",
      "No storytelling or brand-building creative, brand recall is near zero.",
    ],
    whyThisScore: "Creative scores 25, effectively non-functional as a growth channel. The paid channel is currently generating negative ROI due to creative fatigue and no targeting strategy.",
  },
  social: {
    score: 22,
    subMetrics: [
      { name: "Follower Count", score: 18, benchmark: 70 },
      { name: "Post Frequency", score: 20, benchmark: 65 },
      { name: "Reels Ratio", score: 25, benchmark: 60 },
      { name: "Avg. Engagement Rate", score: 22, benchmark: 55 },
      { name: "UGC Volume", score: 20, benchmark: 58 },
      { name: "Community Response Rate", score: 28, benchmark: 62 },
    ],
    whatsWorking: [
      "The 2 posts that exist have accurate product information.",
      "Profile bio links correctly to website.",
      "One YouTube review collaboration drove measurable traffic spike.",
    ],
    criticalGaps: [
      "Instagram has 1,200 followers with last post 11 weeks ago, effectively abandoned.",
      "No YouTube channel despite tech accessories being the highest-searched category on YouTube.",
      "No engagement strategy, brand mentions go unresponded to, community building is zero.",
    ],
    whyThisScore: "Social scores 22, the lowest in this category audit set. The brand has no social presence to speak of, which is critical in an electronics category where peer reviews and YouTube content drive 60%+ of purchase decisions.",
  },
  funnel: {
    score: 35,
    subMetrics: [
      { name: "Awareness to Landing", score: 42, benchmark: 68 },
      { name: "Landing to PDP", score: 48, benchmark: 65 },
      { name: "PDP to Cart", score: 22, benchmark: 62 },
      { name: "Cart to Checkout", score: 38, benchmark: 70 },
      { name: "Checkout Completion", score: 30, benchmark: 66 },
      { name: "Persona Mapping", score: 28, benchmark: 60 },
    ],
    whatsWorking: [
      "Amazon buy button redirects capture marketplace-intent customers.",
      "Discount code for DTC purchase vs. marketplace is a good conversion incentive.",
      "Homepage clearly shows the main product categories.",
    ],
    criticalGaps: [
      "Homepage redirect to Amazon is prominent, brand is actively sending DTC traffic to marketplace.",
      "No DTC-specific pricing advantage, why buy from website vs. Amazon Prime is unanswered.",
      "Checkout does not support UPI, a critical missing payment method for the student target demographic.",
    ],
    whyThisScore: "Funnel scores 35 because the DTC funnel was never designed as a conversion machine, it was built as a credibility signal for marketplace buyers and was never iterated on.",
  },
  retention: {
    score: 42,
    subMetrics: [
      { name: "Email Capture Rate", score: 40, benchmark: 65 },
      { name: "Subscription Rate", score: 15, benchmark: 55 },
      { name: "Post-Purchase Flow", score: 48, benchmark: 60 },
      { name: "Loyalty Programme", score: 35, benchmark: 52 },
      { name: "Referral Mechanism", score: 42, benchmark: 48 },
      { name: "Repeat Purchase Rate", score: 55, benchmark: 62 },
    ],
    whatsWorking: [
      "Post-purchase 3-email sequence exists with warranty registration prompt, technical requirement met.",
      "WhatsApp broadcast to previous customers on new product launches.",
      "Amazon repeat purchase rate is actually 32%, customers do come back, just not to DTC.",
    ],
    criticalGaps: [
      "DTC email list has only 1,800 addresses despite 3+ years of operating.",
      "No loyalty programme, customers have no incentive to buy DTC vs. marketplace.",
      "No accessory bundle recommendations based on first purchase.",
    ],
    whyThisScore: "Retention scores 42 because the marketplace channel has done the work of retention (Amazon Subscribe & Save, Prime convenience) that should be owned by the brand's own CRM.",
  },
  seo: {
    score: 38,
    subMetrics: [
      { name: "Organic Traffic Share", score: 28, benchmark: 55 },
      { name: "Blog Presence", score: 20, benchmark: 58 },
      { name: "On-Page Optimisation", score: 42, benchmark: 66 },
      { name: "Core Web Vitals", score: 55, benchmark: 70 },
      { name: "Backlink Profile", score: 35, benchmark: 60 },
      { name: "Category Keywords", score: 40, benchmark: 62 },
    ],
    whatsWorking: [
      "Product schema markup is implemented, Google can understand product structure.",
      "Brand search returns correct website as first organic result.",
      "SSL and HTTPS is implemented, basic security SEO requirement met.",
    ],
    criticalGaps: [
      "No content strategy, missing '20000mAh power bank', 'best laptop charger under 2000' and high-intent keywords.",
      "Technical duplicate content issue, product pages exist at multiple URLs.",
      "No regional language content despite 60% of target audience being Hindi-first.",
    ],
    whyThisScore: "SEO scores 38 because the brand has no organic traffic strategy and technical SEO issues are actively suppressing ranking for non-brand queries.",
  },
  whyWhyAnalysis: [
    {
      dimension: "Social",
      score: 22,
      levels: [
        { level: "L1", label: "Symptom", content: "1,200 Instagram followers, last post 11 weeks ago, brand is effectively invisible on social" },
        { level: "L2", label: "Underlying Cause", content: "No dedicated social media resource, founder and ops team are managing marketplace operations only" },
        { level: "L3", label: "Root Cause + Action", content: "The business was built on marketplace distribution which requires no social investment. DTC was added without a corresponding team investment. Fix: hire a part-time social media executive (₹15-20K/month), commit to a 3-post-per-week schedule, and launch a YouTube channel with weekly product comparison videos targeting student buyers." },
      ],
    },
    {
      dimension: "Creative",
      score: 25,
      levels: [
        { level: "L1", label: "Symptom", content: "5 ads running, all 12+ weeks old, estimated negative ROAS on paid channel" },
        { level: "L2", label: "Underlying Cause", content: "No creative production process or budget allocated to DTC paid marketing" },
        { level: "L3", label: "Root Cause + Action", content: "Marketplace success created a false sense of security about DTC. No paid marketing investment has ever been made with a clear DTC acquisition brief. Fix: brief 2 YouTube tech reviewers for product review videos (₹30-50K total), repurpose as 10 paid ad formats, launch with ₹10K/day test budget on a 30-day performance learning period." },
      ],
    },
    {
      dimension: "Funnel",
      score: 35,
      levels: [
        { level: "L1", label: "Symptom", content: "DTC conversion at 0.6%, 5x below category average of 3%" },
        { level: "L2", label: "Underlying Cause", content: "Website actively redirects customers to Amazon, lacks DTC-specific value proposition, and missing UPI" },
        { level: "L3", label: "Root Cause + Action", content: "The website was never positioned as a conversion machine, it was a credibility signal. Fix: remove Amazon redirect from homepage, create a 'Buy Direct, Save 12% vs. marketplace' value proposition, add UPI and EMI at checkout." },
      ],
    },
  ],
  recommendations: [
    {
      title: "Remove Amazon redirect and create a 'Buy Direct' DTC value proposition",
      predictedImpact: "+200-300% DTC conversion rate from current 0.6% baseline",
      impactReasoning: "The homepage link redirecting customers to Amazon is actively cannibalising DTC conversion. A 'Buy Direct, Save 12%' positioning plus UPI checkout can push DTC conversion from 0.6% to 1.8-2.4%.",
      ice: { impact: 10, confidence: 9, ease: 9 },
      difficulty: "Easy",
      whyWeSaidThis: "This is a single homepage change that stops the brand sabotaging its own DTC revenue. Every visitor to the website who clicks 'Buy on Amazon' is a customer you're giving away.",
      implementationTemplate: "**Day 1:** Remove 'Buy on Amazon' from homepage hero. Replace with 'Buy Direct, ₹X cheaper + free warranty registration'.\n\n**Day 2:** Add UPI payment method at checkout.\n\n**Day 3:** Add a 'Why Buy Direct?' section: faster warranty support, exclusive colourways, DTC loyalty points.\n\n**Week 2:** A/B test homepage with new vs. old hero CTA. Track DTC conversion rate daily.",
      done: false,
      saved: false,
    },
    {
      title: "Import 400+ Amazon reviews to DTC website",
      predictedImpact: "+40-60% DTC add-to-cart rate",
      impactReasoning: "You have 400+ Amazon reviews that are not being used on your DTC site. Importing them with a 'Verified Purchase' badge dramatically closes the trust gap that is suppressing DTC conversion.",
      ice: { impact: 8, confidence: 9, ease: 10 },
      difficulty: "Easy",
      whyWeSaidThis: "Zero DTC reviews is your most fixable trust gap. You already have the social proof, you just haven't moved it to where DTC buyers need to see it.",
      implementationTemplate: "**Step 1:** Export Amazon reviews via API or manual export tool.\n\n**Step 2:** Import to Shopify/WooCommerce reviews widget (Judge.me or Okendo support Amazon import).\n\n**Step 3:** Display 'Verified Purchase from Amazon' badge on imported reviews for transparency.\n\n**Step 4:** Set up DTC review collection flow so new DTC reviews start accumulating.",
      done: false,
      saved: false,
    },
    {
      title: "Launch a YouTube channel with weekly tech comparison content",
      predictedImpact: "+150-200% organic traffic in 6 months",
      impactReasoning: "Electronics buyers use YouTube as a primary research channel, 68% of Indian electronics purchases are influenced by YouTube content. A channel targeting 'best power bank under 1500', 'Voltiq vs. Ambrane' generates organic acquisition at near-zero cost.",
      ice: { impact: 9, confidence: 7, ease: 5 },
      difficulty: "Medium",
      whyWeSaidThis: "You have genuine product quality and 400+ positive reviews. You need a channel that lets buyers discover and research you outside of marketplace search. YouTube is the highest-ROI content investment for your category.",
      implementationTemplate: "**Month 1:** Launch channel with 4 cornerstone videos: product unboxing, vs-competitor comparison, '5 uses for your Voltiq charger', and buyer's guide for your category.\n\n**Month 2-3:** Partner with 2-3 student tech YouTubers (50-100K subscribers) for product placements.\n\n**Month 3+:** Repurpose YouTube content as Meta and Instagram Reels for paid advertising.",
      done: false,
      saved: false,
    },
  ],
  competitorBenchmark: [
    { brand: "Voltiq", brandHealth: 38, pdp: 32, creative: 25, social: 22, funnel: 35, retention: 42, seo: 38, isAudited: true },
    { brand: "Ambrane", brandHealth: 62, pdp: 65, creative: 58, social: 55, funnel: 60, retention: 58, seo: 62 },
    { brand: "Zebronics", brandHealth: 58, pdp: 60, creative: 55, social: 52, funnel: 58, retention: 54, seo: 58 },
    { brand: "Portronics", brandHealth: 55, pdp: 58, creative: 52, social: 50, funnel: 54, retention: 50, seo: 55 },
    { brand: "boAt (Accessories)", brandHealth: 78, pdp: 80, creative: 76, social: 82, funnel: 74, retention: 72, seo: 70 },
  ],
  competitorTakeaway:
    "Voltiq scores below the category floor set by Ambrane and Portronics. The gap to boAt Accessories (38 vs. 78) illustrates the full DTC infrastructure investment needed. Ambrane at 62 is the realistic 12-month benchmark target.",
  upsellPriority: [
    { service: "Homepage + Buy Direct CRO", currentStatus: "Active Amazon redirect on homepage", priority: 1, pitchAngle: "You're paying for traffic and then sending it to Amazon, fix this today before any other action" },
    { service: "Amazon Review Import to DTC", currentStatus: "0 DTC reviews, 400+ on Amazon", priority: 2, pitchAngle: "Free social proof sitting in Amazon's database, 1-day task to move it to where DTC buyers need it" },
    { service: "YouTube Channel Launch", currentStatus: "No YouTube presence", priority: 3, pitchAngle: "68% of electronics purchase decisions involve YouTube, this is the primary missing acquisition channel for your category" },
    { service: "Social Media Programme", currentStatus: "1,200 followers, 11 weeks without a post", priority: 4, pitchAngle: "A part-time social hire at ₹15K/month can rebuild credibility in 90 days, currently a trust risk not an asset" },
    { service: "UPI Checkout + EMI Options", currentStatus: "Missing key payment methods", priority: 5, pitchAngle: "Target demographic is students, UPI and EMI are table-stakes for conversion in this segment" },
    { service: "Compatibility Guide on PDPs", currentStatus: "Not present", priority: 6, pitchAngle: "Top electronics objection is 'will this work with my device', a 1-page compatibility guide per SKU removes this barrier" },
  ],
  status: "complete",
  createdAt: subDays(new Date(), 30),
  rubricVersion: "v1.0",
  modelVersion: "Llama 3.3 70B (Groq)",
};

// ─── Sample Audit 6: Home Decor / Almost-there (69) ──────────────────────────
export const sampleAudit6: Audit = {
  id: "sample-6",
  brandName: "Kasa Living",
  brandUrl: "https://kasaliving.in",
  metaAdLibraryUrl: "https://facebook.com/ads/library",
  instagramHandle: "@kasaliving",
  category: "Home Decor",
  competitorUrls: [],
  aboutBrand:
    "Kasa Living is a Mumbai-based premium home decor brand offering handcrafted cushion covers, throws, table linen, and accent furniture sourced from Rajasthan artisan clusters. Founded in 2020 by an architect and a textile designer, the brand has built a cohesive design aesthetic that has attracted a 112K Instagram following and a loyal customer base among premium urban home buyers. With an average order value of ₹2,800, the brand has strong unit economics, but checkout drop-off at 68% and a broken gift-wrapping upsell feature are costing them an estimated ₹1.2 Cr in annual revenue.",
  brandHealthScore: 69,
  executiveSummary:
    "Kasa Living has all the ingredients for a ₹25 Cr brand, premium positioning, design credibility, loyal community, and strong unit economics. They are being held back by specific, fixable funnel and checkout failures rather than any strategic gap.",
  strategicOneLiner:
    "Premium positioning, beautiful products, and an engaged community, the gap between 69 and 85 is not about brand or strategy, it's about fixing a broken checkout, activating a dormant referral programme, and building a content strategy to convert their design authority into SEO traffic.",
  pdp: {
    score: 78,
    subMetrics: [
      { name: "Hero Image Quality", score: 92, benchmark: 75 },
      { name: "Copy Clarity", score: 80, benchmark: 70 },
      { name: "Social Proof Density", score: 72, benchmark: 65 },
      { name: "CTA Prominence", score: 65, benchmark: 72 },
      { name: "Trust Signals", score: 78, benchmark: 68 },
      { name: "Mobile UX", score: 80, benchmark: 71 },
    ],
    whatsWorking: [
      "Hero lifestyle photography is exceptional, room-context images convert 40% better than product isolation shots.",
      "Artisan story section on every PDP drives 3x higher average time-on-page vs. category average.",
      "Dimension and care guide is thorough, reduces return rate for home textiles.",
    ],
    criticalGaps: [
      "CTA button is secondary-action prominence, 'Add to Cart' competes visually with 'Add to Wishlist'.",
      "Gift wrapping upsell at PDP is broken on Safari iOS, affecting ~22% of DTC traffic.",
      "No 'Complete the look' product pairing, missed AOV upsell for premium home category.",
    ],
    whyThisScore: "PDPs score 78 because visual quality is genuinely excellent but conversion mechanics, CTA hierarchy, broken upsell, missing pairing, are costing real revenue.",
  },
  creative: {
    score: 72,
    subMetrics: [
      { name: "Image-to-Video Ratio", score: 65, benchmark: 65 },
      { name: "Active Ad Count", score: 75, benchmark: 60 },
      { name: "Creative Refresh Rate", score: 72, benchmark: 58 },
      { name: "Hook Diversity", score: 70, benchmark: 62 },
      { name: "UGC Integration", score: 78, benchmark: 55 },
      { name: "Brand Consistency", score: 88, benchmark: 74 },
    ],
    whatsWorking: [
      "Home styling UGC with customer room transformations performs 4x better than brand photography ads.",
      "Seasonal campaign creative is well-executed, Diwali and Holi collections drove highest-ever ROAS.",
      "Brand visual consistency is exceptional, ads are immediately recognisable.",
    ],
    criticalGaps: [
      "Video ad production is ad-hoc, no systematic room transformation video series.",
      "No Reels ads specifically designed for the Instagram-first shopping behaviour of their core 25-35 audience.",
      "Creator collaboration programme is informal, 3 creators but no contract, no exclusivity, no performance tracking.",
    ],
    whyThisScore: "Creative scores 72 because the quality of existing creatives is high but the volume and systematic approach are missing. Seasonal spikes show what's possible, the gap is maintaining that quality consistently.",
  },
  social: {
    score: 80,
    subMetrics: [
      { name: "Follower Count", score: 82, benchmark: 70 },
      { name: "Post Frequency", score: 78, benchmark: 65 },
      { name: "Reels Ratio", score: 80, benchmark: 60 },
      { name: "Avg. Engagement Rate", score: 84, benchmark: 55 },
      { name: "UGC Volume", score: 82, benchmark: 58 },
      { name: "Community Response Rate", score: 76, benchmark: 62 },
    ],
    whatsWorking: [
      "112K followers with 4.1% engagement rate, well above the Home Decor category average of 2.4%.",
      "'Home transformation' content series with before/after styling drives highest save rates.",
      "Consistent visual aesthetic that mirrors the brand's design identity, strong brand recall.",
    ],
    criticalGaps: [
      "No Pinterest presence despite Home Decor being Pinterest's #1 category globally.",
      "Instagram Stories have no shoppable product link strategy, large engagement audience not converting.",
      "Brand collaborations with interior designers are informal, no structured ambassador programme.",
    ],
    whyThisScore: "Social scores 80 because content quality is high and community engagement is genuine. The gaps are in untapped channels (Pinterest) and converting engaged stories viewers to purchasers.",
  },
  funnel: {
    score: 58,
    subMetrics: [
      { name: "Awareness to Landing", score: 78, benchmark: 68 },
      { name: "Landing to PDP", score: 72, benchmark: 65 },
      { name: "PDP to Cart", score: 55, benchmark: 62 },
      { name: "Cart to Checkout", score: 48, benchmark: 70 },
      { name: "Checkout Completion", score: 42, benchmark: 66 },
      { name: "Persona Mapping", score: 55, benchmark: 60 },
    ],
    whatsWorking: [
      "Room-context photography on landing pages reduces bounce rate vs. category benchmark.",
      "Free shipping above ₹2,500 aligns with AOV, most buyers qualify automatically.",
      "Limited edition collection scarcity messaging is driving above-average add-to-cart urgency.",
    ],
    criticalGaps: [
      "Checkout drop-off at 68% vs. 45% benchmark, the single biggest revenue leak in the business.",
      "Gift wrapping upsell broken on Safari iOS, estimated ₹1.2 Cr annual revenue impact.",
      "No express checkout option, the target audience (premium urban) has high time-value and low patience for friction.",
    ],
    whyThisScore: "Funnel scores 58 because checkout is broken at a specific, fixable technical level. The brand health score would jump to 75+ if checkout issues alone were resolved.",
  },
  retention: {
    score: 72,
    subMetrics: [
      { name: "Email Capture Rate", score: 78, benchmark: 65 },
      { name: "Subscription Rate", score: 45, benchmark: 55 },
      { name: "Post-Purchase Flow", score: 75, benchmark: 60 },
      { name: "Loyalty Programme", score: 68, benchmark: 52 },
      { name: "Referral Mechanism", score: 58, benchmark: 48 },
      { name: "Repeat Purchase Rate", score: 72, benchmark: 62 },
    ],
    whatsWorking: [
      "Post-purchase email series is 4 touches with interior styling tips, exceptional for the category.",
      "Loyalty programme has 48% activation rate with a tiered structure.",
      "Repeat purchase rate at 28% is above category average, community loyalty is real.",
    ],
    criticalGaps: [
      "Referral programme exists but conversion is 2%, reward (₹100 off) is too small for ₹2,800 AOV.",
      "No seasonal home decor lookbook sent to email subscribers, missed occasion-driven repurchase.",
      "Email list growth rate has slowed, no active capture mechanism beyond checkout sign-up.",
    ],
    whyThisScore: "Retention scores 72, above category average with genuine repeat purchase behaviour. The gap is in the referral programme (under-rewarded) and absence of a proactive seasonal re-engagement strategy.",
  },
  seo: {
    score: 52,
    subMetrics: [
      { name: "Organic Traffic Share", score: 45, benchmark: 55 },
      { name: "Blog Presence", score: 48, benchmark: 58 },
      { name: "On-Page Optimisation", score: 58, benchmark: 66 },
      { name: "Core Web Vitals", score: 65, benchmark: 70 },
      { name: "Backlink Profile", score: 48, benchmark: 60 },
      { name: "Category Keywords", score: 42, benchmark: 62 },
    ],
    whatsWorking: [
      "Product page titles include primary material keywords, 'handcrafted cotton cushion cover' style naming.",
      "Google Shopping feed is active, product ads appear for category searches.",
      "Core Web Vitals pass on desktop, site speed is acceptable.",
    ],
    criticalGaps: [
      "No interior design or home styling content, missing 'bohemian living room ideas', 'Rajasthani home decor' searches.",
      "No Pinterest presence, significant organic traffic source for home decor being completely ignored.",
      "Backlink profile is thin, no PR strategy, no interior design blog features.",
    ],
    whyThisScore: "SEO scores 52 because there's no content programme to capture the significant informational intent traffic in the home decor category. Pinterest alone could drive 30-40% of organic traffic for a brand with Kasa Living's visual content quality.",
  },
  whyWhyAnalysis: [
    {
      dimension: "Funnel",
      score: 58,
      levels: [
        { level: "L1", label: "Symptom", content: "Checkout drop-off at 68% vs. 45% benchmark, estimated ₹1.8 Cr annual revenue loss" },
        { level: "L2", label: "Underlying Cause", content: "Gift wrapping upsell is broken on Safari iOS (22% of traffic), no express checkout, and a 4-step checkout process for a premium audience" },
        { level: "L3", label: "Root Cause + Action", content: "Website was built on a custom platform where iOS Safari compatibility was never QA'd. Fix: debug gift wrapping feature on Safari iOS (1-day developer task), add Razorpay 1-click checkout for returning customers, reduce to 2-step checkout flow." },
      ],
    },
    {
      dimension: "SEO",
      score: 52,
      levels: [
        { level: "L1", label: "Symptom", content: "22% of traffic from organic search vs. 35% for leading Home Decor DTC brands" },
        { level: "L2", label: "Underlying Cause", content: "No interior design or home styling blog content, missing all informational intent searches" },
        { level: "L3", label: "Root Cause + Action", content: "The founding team's design expertise has not been translated into a content programme. Fix: launch a 'Kasa Design Studio' blog with monthly interior design guides, create a Pinterest business account and pin every product photo, and start a PR outreach programme targeting interior design publications." },
      ],
    },
  ],
  recommendations: [
    {
      title: "Fix gift-wrap upsell on Safari iOS and add express checkout",
      predictedImpact: "+30-45% checkout completion rate",
      impactReasoning: "A broken upsell on 22% of your audience is directly suppressing checkout completion. Combined with adding Razorpay one-click checkout, this single sprint recovers estimated ₹1.2-1.8 Cr in annual revenue.",
      ice: { impact: 10, confidence: 10, ease: 8 },
      difficulty: "Easy",
      whyWeSaidThis: "This is the closest thing to free money in this audit. The revenue impact is calculable, the fix is 1-2 developer days, and the confidence level is near-certain.",
      implementationTemplate: "**Day 1:** Debug gift-wrap component on Safari iOS 15-17, likely a CSS flexbox or z-index issue. Test fix across all iOS versions.\n\n**Day 2:** Integrate Razorpay Magic Checkout for returning customers, shows saved address and payment in one tap.\n\n**Day 3:** A/B test new vs. old checkout. Primary metric: checkout completion rate. Secondary: gift-wrap attach rate.\n\n**Target:** Reduce checkout drop-off from 68% to 45-50% within 30 days.",
      done: false,
      saved: false,
    },
    {
      title: "Launch on Pinterest with full product catalogue",
      predictedImpact: "+40-60% organic traffic in 90 days",
      impactReasoning: "Pinterest is the #1 discovery platform for home decor globally. Brands in your category with comparable visual content quality drive 30-40% of organic traffic from Pinterest. Your entire product catalogue is Pinterest-ready content.",
      ice: { impact: 8, confidence: 8, ease: 8 },
      difficulty: "Easy",
      whyWeSaidThis: "You have 112K Instagram followers but zero Pinterest presence. For Home Decor, Pinterest drives purchase intent that Instagram engagement doesn't, users save for future purchases rather than double-tapping and scrolling.",
      implementationTemplate: "**Week 1:** Create Pinterest Business account, verify website, install Pinterest tag.\n\n**Week 2:** Upload complete product catalogue as Buyable Pins. Create 5 boards: Living Room, Bedroom, Kitchen, Gifting, Seasonal.\n\n**Week 3:** Implement 'Rich Pins' for product pages, automatically syncs price, availability.\n\n**Week 4:** Begin weekly Idea Pin creation (3-5 pins/week) showing room transformation stories.",
      done: false,
      saved: false,
    },
    {
      title: "Increase referral reward to ₹400 per referral and relaunch programme",
      predictedImpact: "+15-25% customer acquisition via referral within 60 days",
      impactReasoning: "Your referral programme converts at 2% because ₹100 off against a ₹2,800 AOV is a 3.5% discount, below the 10-15% threshold that motivates sharing behaviour. Increasing to ₹400 (14% AOV) will cross the motivation threshold.",
      ice: { impact: 7, confidence: 8, ease: 9 },
      difficulty: "Easy",
      whyWeSaidThis: "Referral acquisition is zero-CAC growth from your most satisfied customers. Your current programme is structurally under-rewarded for your AOV. The fix is a single number change plus an activation campaign.",
      implementationTemplate: "**Day 1:** Update referral reward to ₹400 for referrer + ₹400 for referred buyer.\n\n**Day 2:** Email all past customers announcing the enhanced programme: 'Refer a friend, both get ₹400, because good taste deserves sharing.'\n\n**Week 2:** Instagram Stories series on how to share your referral link.\n\n**Month 1:** Track referral conversion rate, target 8-10% of referred link clicks converting to orders.",
      done: false,
      saved: false,
    },
  ],
  competitorBenchmark: [
    { brand: "Kasa Living", brandHealth: 69, pdp: 78, creative: 72, social: 80, funnel: 58, retention: 72, seo: 52, isAudited: true },
    { brand: "The Rug Republic", brandHealth: 72, pdp: 75, creative: 70, social: 74, funnel: 70, retention: 68, seo: 70 },
    { brand: "Ellementry", brandHealth: 76, pdp: 80, creative: 74, social: 78, funnel: 72, retention: 74, seo: 72 },
    { brand: "Chumbak", brandHealth: 70, pdp: 72, creative: 76, social: 72, funnel: 68, retention: 68, seo: 65 },
    { brand: "Fabindia Home", brandHealth: 78, pdp: 82, creative: 72, social: 76, funnel: 76, retention: 78, seo: 78 },
  ],
  competitorTakeaway:
    "Kasa Living's Social score of 80 is best-in-class, they outperform Fabindia Home on community engagement. The 9-point gap to Fabindia (69 vs. 78) is concentrated in Funnel and SEO, both eminently fixable technical and content issues rather than brand or product weaknesses.",
  upsellPriority: [
    { service: "Checkout Bug Fix + Express Checkout", currentStatus: "Safari iOS gift-wrap broken, 4-step checkout", priority: 1, pitchAngle: "₹1.8 Cr in annual revenue sitting behind a 1-day developer task, this is the highest ROI fix in this audit" },
    { service: "Pinterest Launch", currentStatus: "Zero Pinterest presence", priority: 2, pitchAngle: "Home Decor's highest-ROI organic channel is completely untapped, your visual content is Pinterest-native" },
    { service: "Referral Programme Relaunch", currentStatus: "2% conversion, ₹100 reward", priority: 3, pitchAngle: "One number change (₹100 → ₹400) doubles your referral conversion rate overnight" },
    { service: "Interior Design Blog Programme", currentStatus: "No content programme", priority: 4, pitchAngle: "Design expertise is the brand's credibility, translating it into blog content turns authority into organic traffic" },
    { service: "Complete-the-Look PDP Pairings", currentStatus: "No product pairing", priority: 5, pitchAngle: "₹2,800 AOV customers are exactly the segment that buys complementary pieces, a cross-sell widget is a 1-week task" },
    { service: "Instagram Stories Shopping Strategy", currentStatus: "No link sticker strategy", priority: 6, pitchAngle: "Your Stories get 3x more views than your posts but zero commerce intent capture, add product links to every relevant story" },
  ],
  status: "complete",
  createdAt: subDays(new Date(), 45),
  rubricVersion: "v1.0",
  modelVersion: "Llama 3.3 70B (Groq)",
};

export const SAMPLE_AUDITS: Audit[] = [
  sampleAudit1,
  sampleAudit2,
  sampleAudit3,
  sampleAudit4,
  sampleAudit5,
  sampleAudit6,
];

// ─── Mock Recent Audits (dashboard) ──────────────────────────────────────────
export const MOCK_RECENT_AUDITS = [
  {
    id: "audit-101",
    brandName: "Plum Organics",
    category: "Wellness",
    brandHealthScore: 74,
    status: "complete" as AuditStatus,
    createdAt: subHours(new Date(), 3),
  },
  {
    id: "audit-102",
    brandName: "The Souled Store",
    category: "Fashion",
    brandHealthScore: 68,
    status: "complete" as AuditStatus,
    createdAt: subDays(new Date(), 2),
  },
  {
    id: "audit-103",
    brandName: "Mamaearth",
    category: "Beauty",
    brandHealthScore: 81,
    status: "complete" as AuditStatus,
    createdAt: subDays(new Date(), 5),
  },
];

export const MOCK_HISTORY_AUDITS = [
  ...MOCK_RECENT_AUDITS,
  {
    id: "audit-104",
    brandName: "Sugar Cosmetics",
    category: "Beauty",
    brandHealthScore: 77,
    status: "complete" as AuditStatus,
    createdAt: subDays(new Date(), 9),
  },
  {
    id: "audit-105",
    brandName: "Boat Lifestyle",
    category: "Electronics",
    brandHealthScore: 82,
    status: "complete" as AuditStatus,
    createdAt: subDays(new Date(), 12),
  },
  {
    id: "audit-106",
    brandName: "Bombay Shirt Company",
    category: "Fashion",
    brandHealthScore: 65,
    status: "complete" as AuditStatus,
    createdAt: subMonths(new Date(), 1),
  },
];
