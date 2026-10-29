# BestLang

A satirical landing page and interactive builder created at [Yay-Yay Conf 2026](https://yayyay.events/) during **Building Better UI With AI (Without Creating Slop)**. The landing page was built by following the workshop's process for creating a UI with AI.

BestLang is a fictional programming language designed to protect programmers from AI: it writes the code itself, but only a programmer can download and run it. The code is automated; job security is a language feature.

## The experience

1. Describe a system, or choose a preset.
2. Generate an architecture and fictional BestLang source using DeepSeek, with local examples available without an API key.
3. Explore the architecture in an interactive 3D canvas and inspect or copy each module's source.
4. Pass a three-question programming quiz to unlock a `.tar` download containing `.best` modules, `architecture.json`, a README, and a human-required runbook.

There is no BestLang compiler or runtime. The archive cannot run an application, and the browser-side quiz is a playful gate, not authentication or proof of professional expertise.

## Stack

Next.js App Router, React, TypeScript, Tailwind CSS, and Lucide icons. The architecture view uses the Canvas 2D API for 3D projection; archives are assembled in the browser. DeepSeek requests run through a server-side route.

## Run locally

```bash
cd crazy-landing-page
npm ci
npm run dev
```

Run these commands from the repository root. Open the URL printed by Next.js. To enable live architecture generation, copy `.env.example` to `.env.local` in this directory and set your own key:

```dotenv
DEEPSEEK_API_KEY=your_key_here
# Optional; defaults to deepseek-flash:
# DEEPSEEK_MODEL=deepseek-flash
```

Restart the development server after changing environment variables. The key stays on the server and `.env.local` is ignored by Git. Never prefix it with `NEXT_PUBLIC_`.

Without a key, the page uses local domain-specific examples. If DeepSeek times out or returns an invalid architecture, generation falls back to a local example and the interface identifies the fallback. The demo generates architecture and fictional BestLang snippets; it does not deploy or execute an application.

## Production

```bash
npm run build
npm start
```

Deploy on a host supporting Next.js server routes and configure the same environment variables there. `/api/generate` validates input and graph output, rejects cross-origin requests, and limits live generation to 12 requests per minute per server process. For a public multi-instance deployment, replace that backstop with a shared rate limiter and configure provider spending limits.

The integration follows DeepSeek's [JSON output](https://api-docs.deepseek.com/guides/json_mode/) and [thinking-mode](https://api-docs.deepseek.com/guides/thinking_mode/) documentation; thinking is disabled for lower generation latency.

The endpoint has no authentication. Its origin check and per-process limit are demo safeguards, not access control; direct HTTP clients can still call it. Prompts are sent to DeepSeek when live generation is enabled.

## Checks

Run from this project directory:

```bash
npm run lint
npm run typecheck
npm run build
```
