# FLOWRA AI Website

Static site: plain HTML, CSS and JavaScript. No build step is needed to run or deploy it.
Pages are sections switched by the URL hash (#home, #about, #services, #how-it-works, #demo, #dashboard, #contact).

## Files
- index.html, style.css, script.js: structure, styling, navigation, demos, contact form
- assets/: logo, favicons, social preview image, self-hosted fonts (Sora, Manrope)
- assets/js/hero.js: compiled Three.js hero (glass sphere). Source is src/hero.js
- netlify.toml: cache and security headers

## Run locally
python3 -m http.server 8000   then open http://localhost:8000
(Opening index.html directly also works, but use a server to test the 3D hero.)

## Rebuild the 3D hero (optional, only if you edit src/hero.js)
npm install three esbuild
npx esbuild src/hero.js --bundle --minify --format=iife --global-name=FlowraHero --outfile=assets/js/hero.js --target=es2019

## Deploy to Netlify
1. Netlify dashboard > Add new site > Deploy manually (or connect your Git repo).
2. Drag the whole flowra folder in. No build command; publish directory is the folder root.
3. Site settings > Forms: confirm form detection is on. Submissions appear under Forms > contact.
4. Optional: Forms > Settings & usage > Form notifications > add an email notification to flowraai.pk@gmail.com.
No API keys are required.

## FAQ chatbot (LLM)
The chat bubble calls a Netlify Function (netlify/functions/chat.js) that holds the API key server-side.
IMPORTANT: Netlify drag-and-drop deploys do NOT run Functions. Deploy via Git (GitHub) or the Netlify CLI (`npx netlify deploy --prod`).
1. Get an Anthropic API key from console.anthropic.com.
2. Netlify > Site settings > Environment variables: add ANTHROPIC_API_KEY (optional: ANTHROPIC_MODEL).
3. Redeploy. Usage is billed to your Anthropic account; set a spend limit there.
Without the function, the bubble falls back to basic keyword answers and says so ("Offline mode").
Edit the FACTS in chat.js whenever your services or details change.

## Honesty notes
- The chat and dashboard are simulated demos with sample data stored only in the visitor's browser.
- WhatsApp API and n8n are planned, not live.
- The contact form shows success only when Netlify accepts the POST. It fails locally by design and shows the email fallback.
- Pages use hash URLs, so search engines see one page; per-page SEO would need separate HTML files.
