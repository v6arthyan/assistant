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
- Server endpoint requires ChatGPT visitor identity and a same-origin JSON request. Preserve the existing private audience. Team mode is not a separate staff authorisation boundary.
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
