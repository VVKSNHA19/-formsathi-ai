# FormSathi AI — Gemini-powered submission build

## What changed
This version is genuinely AI-powered: the browser sends the form to a server-side Next.js API route, and that route calls Gemini. The Gemini key is never sent to the browser.

## Local run
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Put your Gemini API key in `GEMINI_API_KEY`.
4. Run `npm install`
5. Run `npm run dev`
6. Open http://localhost:3000

## Vercel
1. Upload/import this project into Vercel (GitHub is easiest).
2. In Vercel Project > Settings > Environment Variables, add:
   GEMINI_API_KEY = your key
3. Apply it to Production/Preview/Development as desired.
4. Redeploy.
5. Open the public Vercel URL and test with `public/dummy-data/dummy_community_assistance.txt`.

## Demo safety
Use only dummy data. FormSathi explains and suggests; it never makes final eligibility, legal, financial, or health decisions.
