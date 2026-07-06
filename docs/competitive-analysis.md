# SolePrompt Competitive Analysis

*Last updated: July 2026*

Research covers PromptBase, PromptHero, FlowGPT, AIPRM, Gumroad AI prompt stores, PromptDen, and Krea — mapped against the SolePrompt codebase audit.

---

## 1. Features We Already Have

| Feature | Competitor analog | SolePrompt implementation |
|---------|-------------------|---------------------------|
| Prompt marketplace browse | PromptBase, FlowGPT | `/explore`, `/search`, `/categories` |
| Text search (title, description, tags) | All marketplaces | `getPublishedPrompts({ search })` in `src/lib/marketplace.ts` |
| Category browsing | PromptBase, PromptHero | `/categories`, `/categories/[slug]` |
| Prompt detail with preview | PromptBase, Gumroad | `/prompts/[id]` — preview, blurred locked content |
| Stripe checkout (paid + free) | PromptBase, Gumroad | `src/app/actions/purchase.ts`, webhook |
| Buyer library | PromptBase | `/buyer` |
| Purchase history | Gumroad | `/buyer/history` |
| Reviews (DB + aggregate ratings) | PromptBase, Gumroad | `Review` model, ratings on `PromptCard` |
| Favorites / wishlist | AIPRM, PromptDen | `Wishlist` model, `/buyer/favorites` |
| Creator public profiles | PromptBase seller pages | `/creators/[username]` |
| Seller upload & edit | PromptBase | `/seller/upload`, `/seller/prompts` |
| Admin prompt review (approve/reject) | PromptBase manual review | `/admin/prompts` |
| Featured prompts | PromptBase | `featured` flag, `getFeaturedPrompts()` |
| View counts | FlowGPT, PromptBase analytics | `Prompt.views`, `recordPromptView()` |
| Recently viewed | AIPRM favorites/history | `PromptView` model, `/buyer/recent` |
| X Checker (free lead magnet) | — (differentiator) | `/tools/x-checker` |
| X Scrubber (paid tool) | — (differentiator) | `/buyer/scrubber` |
| Social Scrubbing Suite | — (differentiator) | `/buyer/social` |
| Admin analytics (funnel, UTM, revenue) | PromptBase seller analytics | `/admin`, `src/lib/analytics/*` |
| UTM acquisition tracking | Gumroad external traffic | `src/lib/utm.ts`, `ToolVisit` model |
| Onboarding checklist | — | `src/lib/onboarding.ts` |
| Email notifications | Gumroad | `src/lib/email.ts` |
| Compatible models & sample output | PromptBase listings | `PromptCard`, prompt detail |
| Copy / download purchased prompts | AIPRM 1-click | `CopyPromptButton`, `DownloadPromptButton` |

---

## 2. Features We're Missing (per competitor)

### PromptBase
| Gap | Notes |
|-----|-------|
| Seller referral links (0% fee on direct traffic) | No per-seller `?via=` codes or referral dashboard |
| PromptBase Select subscription | No monthly all-access tier |
| Seller rank / leaderboard | No seller ranking display |
| Per-prompt analytics (views, sales source) | Seller analytics partially mock |
| Bundles | No multi-prompt bundle SKUs |
| Agent skills (SKILL.md) marketplace | Text prompts only |
| Flash sales / scheduling | No promotional pricing tools |

### PromptHero
| Gap | Notes |
|-----|-------|
| Visual-first grid (image output before text) | Text/sample-output focused, no cover image upload |
| "Remix this prompt" | No one-click remix/fork |
| Model-specific visual filters (style, mood) | Category + price filters only |
| Pro subscription (ad-free, private collections) | No subscription tier |
| Prompt metadata from generated images | N/A for text prompts |

### FlowGPT
| Gap | Notes |
|-----|-------|
| Community upvotes / comments on prompts | No social voting layer |
| Multi-model in-app chat to test prompts | No embedded LLM playground |
| "Flows" — packaged prompt apps | Individual prompts only |
| Quick Mode / Expert Mode creator tools | Standard upload form |
| Mobile app (Emochi) | Web only |

### AIPRM
| Gap | Notes |
|-----|-------|
| Browser extension (in-ChatGPT injection) | Web marketplace only |
| Private prompt lists / team sharing | Favorites exist; no custom lists |
| Verified prompt badge | No curation tier |
| 1-click inject into ChatGPT/Claude | Copy button only |
| Custom GPT prompt management | N/A |

### Gumroad
| Gap | Notes |
|-----|-------|
| Seller owns buyer email list | Clerk auth; no seller-facing email export |
| Tiered pricing on single product | Single price per prompt |
| Affiliate program per product | No affiliate links |
| Product bundles with PDF/video SOPs | Prompt text only |
| Subscription / membership products | One-time purchase only |

### PromptDen
| Gap | Notes |
|-----|-------|
| Browser extension (PromptForge) | No extension |
| Prompt variables with fill-in preview | No `{{variable}}` parser UI |
| Tone / writing style modifiers | N/A |
| Collections (curated lists) | Categories only |
| Verified community prompts | Admin review only |

### Krea
| Gap | Notes |
|-----|-------|
| Real-time image generation | Not in scope (text marketplace) |
| Node-based workflow builder | N/A |
| LoRA training / custom models | N/A |
| Open prompts API / dataset | No public API |

---

## 3. Features That Would Generate the Most Revenue

| Priority | Feature | Rationale |
|----------|---------|-----------|
| **High** | Seller referral links (PromptBase model) | Lets creators drive 0-fee sales from their audience; increases seller motivation to promote SolePrompt |
| **High** | Prompt bundles / packs | Gumroad's top sellers use $19–49 bundles; higher AOV than single $2–10 prompts |
| **High** | Subscription tier (PromptBase Select analog) | Recurring revenue; buyers get unlimited access to a prompt library |
| **Medium** | Stripe Connect seller payouts | Removes simulated earnings; enables real seller growth |
| **Medium** | Affiliate program (Gumroad 5% channel) | External promoters drive high-intent traffic |
| **Medium** | Tiered pricing (basic/pro on same listing) | Gumroad sweet spot is $30–49 with tiered value |
| **Lower** | Browser extension | High build cost; AIPRM/PromptDen own this niche |

---

## 4. Features That Increase User Retention

| Priority | Feature | Rationale |
|----------|---------|-----------|
| **High** | Favorites + recently viewed (in nav) | Reduces re-discovery friction; AIPRM/PromptDen core loops |
| **High** | Purchaser reviews UI | Social proof drives repeat purchases; Gumroad 4.4+ rating matters |
| **High** | Trending / prompt of the day | FlowGPT/PromptHero surface fresh content daily |
| **High** | Prompt variables preview | PromptDen differentiator; helps buyers evaluate before purchase |
| **Medium** | Better filters (sort, price, rating) | PromptBase/PromptHero discovery quality |
| **Medium** | View counts on cards | Signals popularity; drives FOMO |
| **Medium** | Seller reviews dashboard | Keeps creators engaged post-sale |
| **Medium** | Collections / curated lists | PromptDen Pro feature; organizes repeat browsing |
| **Lower** | Community upvotes | FlowGPT engagement; harder to moderate |

---

## 5. Competitor Feature Matrix

| Feature | SolePrompt | PromptBase | PromptHero | FlowGPT | AIPRM | Gumroad | PromptDen | Krea |
|---------|:----------:|:----------:|:----------:|:-------:|:-----:|:-------:|:---------:|:----:|
| Buy/sell prompts | ✅ | ✅ | ⚠️ free | ⚠️ free | ⚠️ ext | ✅ | 🔜 | ❌ |
| Stripe payments | ✅ | ✅ | ❌ | ⚠️ credits | ❌ | ✅ | — | ✅ |
| Reviews & ratings | ✅ | ✅ | ❌ | ⚠️ upvotes | ❌ | ⚠️ | — | ❌ |
| Favorites / wishlist | ✅ | ✅ | ✅ Pro | ✅ | ✅ | ❌ | ✅ | ❌ |
| Search & filters | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ |
| Creator profiles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Trending / featured | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ⚠️ | ❌ |
| Referral / affiliate links | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Subscription access | ❌ | ✅ Select | ✅ Pro | ✅ Pro | ✅ Plus | ✅ | ✅ Pro | ✅ |
| Bundles | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Browser extension | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Prompt variables preview | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| In-app prompt testing | ❌ | ⚠️ | ✅ gen | ✅ chat | ✅ | ❌ | ✅ ext | ✅ |
| Image-first browsing | ⚠️ | ✅ | ✅ | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Admin analytics | ✅ | ⚠️ seller | ⚠️ Pro | ❌ | ❌ | ⚠️ | ❌ | ❌ |
| Free lead-magnet tool | ✅ X Checker | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ free tier |

**Legend:** ✅ = mature feature · ⚠️ = partial / different model · ❌ = not available · 🔜 = announced / in development

---

## Implementation Notes (this sprint)

Features implemented in this competitive sprint (see git log):

1. Marketplace sort & price filters on explore/search
2. View counts on prompt cards
3. Trending section + prompt of the day on homepage
4. Purchaser review submission on prompt detail
5. Favorite toggle + copy button on prompt detail
6. Public creator profile pages
7. Recently viewed in buyer navigation
8. Seller reviews dashboard
9. Prompt variables preview on listings
10. Min rating filter + anonymous view counting

**Deferred (larger scope / needs migrations):**

- Seller referral links — requires `ReferralCode` schema + Stripe fee logic
- Bundles & subscriptions — new product types + Stripe products
- Stripe Connect payouts — seller onboarding flow
- Browser extension — separate product surface
