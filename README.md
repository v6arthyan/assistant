# VSix Assistant

Investor education and a general team toolkit for V6 Arthgyan LLP, with optional Gemini AI.

## Current activation state

Gemini is prepared but OFF until a Google API key and enable flag are configured as hosted runtime values. No live Gemini request has been verified. The UI shows “Gemini AI — awaiting setup” and continues to offer prepared answers.

## Activate without paid API usage

1. In https://aistudio.google.com/api-keys create a Gemini API key associated with a **Free tier** Google project. Do not enable Cloud Billing or buy credits. Complete any Google-required free-tier verification yourself.
2. Configure `GEMINI_API_KEY` as a **secret** using the hosting environment's native secret facility. Never put it in source code, a GitHub file, browser storage, or chat.
3. Only after confirming the project's Free tier, set `GEMINI_ENABLED=true` in that same runtime environment, and deploy the saved version again to apply the environment revision.
4. Select Gemini AI in the app and test a general, non-sensitive question. This activation test is still outstanding.

The model is fixed to `gemini-3.1-flash-lite`. Availability and quotas are controlled by Google and can change. Application caps do not verify your Google billing tier or guarantee free usage for a paid project. Hosting has its own provider terms and quotas. API calls do not use the user's ChatGPT subscription messages.

## Features

- English/Hindi prepared FAQs with AMFI links.
- Optional AI for general questions, communication drafts and MFD checklists.
- WhatsApp contact: +91 6306522855. Messages are sent only by the visitor in WhatsApp.
- Editable prepared templates and end-of-month SIP mathematical illustration.
- Fallback to prepared answers when Gemini errors, times out or reaches limits.

## Usage and data

- AI is opt-in per page session. Prepared FAQ buttons and templates never call Google.
- Up to 50 AI attempts per UTC day and 5 per UTC minute **across the site**, enforced by atomic D1 updates. Failed attempts count; no retries run automatically.
- Input is limited to 500 characters; history to 3 recent exchanges; model output to 600 tokens. Output may be truncated.
- AI mode sends the question and recent AI exchanges to Google. Google free-tier content may be used to improve its products. Never share client documents, PAN, Aadhaar, banking information, OTPs, credentials or other private details.
- Common numeric identifiers and PAN-like patterns are blocked, but this is a limited heuristic, not comprehensive redaction or DLP.
- D1 stores only aggregate usage bucket names and counts. Questions and answers are held only in browser memory by this app. Provider/platform processing is separate.
- Server endpoint requires ChatGPT visitor identity and a same-origin JSON request. Preserve the existing audience. Team mode is not a separate staff authorisation boundary.
- AI drafts may be wrong; human review is required. No live market data, portal connections, account access, personalised financial advice or transaction execution.

## Develop and deploy

This is a Vinext/Cloudflare Worker application. `public/` contains the UI; `app/api/chat/route.ts` calls `lib/gemini.mjs` server-side. The supplied Sites/Vite integration and `.openai/hosting.json` preserve the existing hosting project. Configure runtime values with native hosting tools and apply D1 migrations via the supported deployment workflow.

Install dependencies using the supported project installer or pnpm. Build through the Sites build helper or `pnpm build` for standalone use. `pnpm dev` runs the framework preview. `node --test tests/gemini.test.mjs` runs isolated, mocked provider tests.

For a local D1 preview after building, apply `drizzle/0000_left_paibok.sql` once using Wrangler's local D1 execute command and `dist/server/wrangler.json`. Production migrations are applied by Sites during publication.

Repository-root `index.html`, `app.js` and `style.css` mirror `public/` for static GitHub Pages. **GitHub Pages alone cannot run the AI backend**; on a static host the assistant falls back to prepared answers. Keep the mirrored UI files in sync. No API key belongs in either copy.

## Validation

Production build; JS syntax check; six mocked backend tests covering authentication, origin validation, input/history bounds, sensitive-pattern rejection, upstream request format, failure handling and quota caps. Browser check confirmed the setup indicator and prepared FAQs. Local migration applied successfully. Live Google authentication, quota, output quality and production AI calls remain unverified until a key is securely configured.

Financial education sources checked 5 November 2026:
- https://www.amfiindia.com/investor
- https://www.amfiindia.com/kyc
- https://www.amfiindia.com/investor/become-mf-distributor?zoneName=sip
- https://www.amfiindia.com/investor/knowledge-center-info?zoneName=riskInMutualFunds

Gemini implementation and pricing references:
- https://ai.google.dev/api/generate-content
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/gemini-api/docs/generate-content/api-key

## Enhanced knowledge — 6 November 2026

- 86 curated bilingual entries across investor basics, servicing, platform support, V6 details and team workflows. Knowledge is in `public/knowledge.mjs`, mirrored at repository root for static hosting.
- Local ranked retrieval understands whole words, English/Hindi/Hinglish aliases and limited spelling variations. Unsupported questions receive an explicit fallback. Team-only entries are omitted from the investor desk's retrieval; this is a UI/content scope, not a confidentiality boundary, because approved knowledge ships as a public asset.
- Searchable cards show topic, source type and review date. Official-source summaries, owner-supplied information, application capabilities and general workflow suggestions have distinct labels. Review dates are not promises of live accuracy; current rules, fees, scheme terms and portal steps must still be verified at source.
- Gemini receives up to three relevant excerpts, bounded to 4,500 characters, with provenance. Its responses return server-selected source references. This supplies context, not model training, live browsing or a guarantee of accuracy. No private employee manuals or client documents have been imported.
- Prepared retrieval consumes no model tokens. Expanded AI context uses the provider's input allowance only when Gemini is configured. Existing activation flags, usage caps, authentication and sensitive-pattern checks remain in place.
- Sixty-eight automated tests pass, covering retrieval quality, multilingual matching, unknown queries, mode scoping, advice boundaries, source metadata and the existing backend protections.


## FOF failure correction — 6 November 2026

The earlier 35-entry release omitted Fund of Funds and could not answer the basic question `WHAT IS FOF`. The catalogue now includes 51 additional finance definitions (86 total) including FOF, ETF, NFO, AUM, AMC, YTM, alpha, beta, debt/hybrid funds, bonds, liquidity and inflation. Definitions have bilingual text and official references.

Regression tests cover the exact reported question, F.O.F. punctuation, Hindi/Hinglish variants, 50 other basic definition questions, false acronym matches, and reachability of every new glossary title. All 68 tests pass. This remains a finite, locally searched glossary in Prepared mode; it is not open-ended AI or a claim to cover every finance term. The UI and unknown-answer message state that limit.


## Guided conversations and portfolio discussion

Prepared mode now handles common greetings, wellbeing questions, thanks, goodbyes and help in English/Hindi/Hinglish. The exact “HOW ARE YOU?” failure has a regression test.

A visible Start portfolio review button opens a five-step educational conversation: goal, horizon, self-described comfort with falls, broad holding categories and review concern. The assistant retains these categorical choices in page memory and produces a discussion brief. It does not score suitability, inspect actual holdings, recommend securities or provide personal buy/sell/allocation instructions. Context resets on New chat, workspace/language change or page reload. No profile is saved or sent to an AI provider in Prepared mode.

Definitions can interrupt a review without advancing its step. Short invalid answers prompt clarification rather than inventing a preference. A Stop review command clears the review state. Guided conversation is separate from Gemini’s optional generation; it works without a key or model-token usage.

88 automated tests pass across social replies, complete English/Hindi portfolio flows, context retention, cancellation and the existing glossary/backend checks. These are bounded conversational intents, not unrestricted natural-language understanding.
