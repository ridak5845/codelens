# CodeLens — Portfolio Materials

---

## Project Description (Long Form — Portfolio Site / GitHub Profile README)

**CodeLens** is a full-stack, AI-powered code review platform that connects to a developer's GitHub account and delivers instant, structured feedback on pull requests and standalone code files. Built solo over a 10-day sprint using the MERN stack and Google's Gemini API, it goes beyond a typical CRUD tutorial project: real OAuth 2.0 authentication, a genuine third-party AI integration with defensive parsing and retry logic, review history persistence, and — going past the core scope — the ability to publish AI findings as real inline comments on a live GitHub PR, compare review runs over time, and track personal code-quality trends. Deployed live on Render and Vercel, entirely on free-tier infrastructure.

## Project Description (Short Form — Resume / LinkedIn Header)

AI-powered code review platform (MERN + Gemini API) — GitHub OAuth, categorized PR/file analysis, inline GitHub comment publishing, review history & analytics. Deployed live.

## Resume Bullet Points

Choose 2–4 depending on space, tailored to the role:

- Built and deployed a full-stack AI code review platform (React, Node/Express, MongoDB) integrating Google's Gemini API to deliver categorized, line-referenced code feedback with security/performance/maintainability scoring.
- Implemented GitHub OAuth 2.0 with a stateless JWT architecture, deliberately chosen over session-based auth to remain resilient to free-tier hosting cold-starts.
- Engineered defensive AI-response handling (schema validation, malformed-JSON retry logic) ensuring reliable structured output from a non-deterministic LLM API.
- Shipped three stretch features beyond core scope: automated GitHub PR comment publishing via the GitHub Reviews API, review-to-review comparison with resolved/new issue tracking, and personal analytics dashboards using recharts.
- Conducted a full security and accessibility hardening pass (rate limiting, input validation, WCAG contrast fixes, centralized error handling) and diagnosed/resolved real production deployment issues across two separate free-tier hosting platforms.

## Interview Talking Points

**"Tell me about a challenging bug you solved."**
The MongoDB connection issue on Day 3 is a strong story: `nslookup` succeeded at the OS level but Node's own DNS resolver failed the exact same SRV lookup — a real environment-specific quirk, not a code bug. Solved by switching to a standard multi-host connection string. Then immediately hit a second, disguised issue — repeated "bad auth" failures that turned out to be a literal `<password>` placeholder still sitting in the connection string, invisible to a visual scan. Found it by writing a one-off script to print the string's raw character codes. Good story because it shows escalating from "try the obvious fix" to "get actual evidence" when guessing stops working.

**"Tell me about a time you had to make a technical trade-off under pressure."**
Day 3: an updated project blueprint specified session-based auth mid-build, conflicting with the JWT architecture already built and approved. Rather than silently picking one, surfaced the conflict explicitly with a real trade-off table (stateless JWT vs. session-store-on-free-tier-hosting) and got a decision before proceeding. The reasoning — Render's free tier spins down idle instances, which would silently break an in-memory session store — turned out to matter in practice, not just in theory.

**"Describe a time you had to debug a production issue."**
Day 6's deployment saga: an app that worked perfectly locally kept showing `localhost` URLs on the live site no matter how many times environment variables were re-saved and redeployed. Systematically ruled out caching, then a CDN/domain-alias mismatch, before discovering the actual root cause — the code fix existed only on the local machine and had never actually been committed and pushed to GitHub, so both hosting platforms were faithfully rebuilding old code. A clean example of not accepting "it should be fixed" and instead verifying at each layer (browser cache → deployment → source) until finding where the chain actually broke.

**"How do you handle working with a third-party API you don't fully control?"**
Built the entire AI review pipeline (`aiReviewService.js`) assuming the model can and will occasionally return malformed output — code-fence-wrapped JSON, schema violations — with a strip-and-retry path rather than trusting the happy path. Also hit two live deprecations mid-build (an SDK package and a specific model name), both discovered via actual runtime errors rather than caught in advance, and resolved by switching to a maintained SDK and a rolling model alias specifically to reduce exposure to the next inevitable change.

## Short Demo Script (60–90 seconds, for a recorded walkthrough)

> "This is CodeLens — an AI-powered code review tool I built and deployed solo over a 10-day sprint.
>
> I sign in with GitHub — real OAuth, no password. [show login]
>
> Here's my repo list, pulled live from the GitHub API. I'll pick a repo and open a pull request. [click through]
>
> Here are the changed files. I click 'Run AI Review' — this sends the real diff to Google's Gemini API. [click, wait]
>
> And here's the result: three scores — security, performance, maintainability — plus categorized findings, each tied to the exact file and line, with a code excerpt for context.
>
> Now here's the part most similar projects don't have: I can publish this directly as a real comment on the actual GitHub PR. [click Post to GitHub, then cut to the real github.com PR showing the comment]
>
> Every review is saved automatically — here's my history, and reopening any past review shows identical results. There's also a single-file mode for reviewing code outside of any PR, and an analytics page tracking my scores over time.
>
> Everything here is live, on free-tier hosting — Render for the backend, Vercel for the frontend, MongoDB Atlas for the database. Full source and documentation are on GitHub."

## Suggested Screenshots / Demo Media

For a portfolio page or README, in priority order:
1. The live dashboard showing real repo cards (proves real GitHub integration, not mock data)
2. A completed AI review with the score panel + findings visible (the core value prop, one shot)
3. The real GitHub PR showing an actual posted comment (this is the single most convincing "this is real" proof point available — screenshot from `github.com`, not the app itself)
4. The Analytics page with both charts populated
5. Mobile-width screenshot of any page, demonstrating the responsive design work from Day 7/8

## Recommended GitHub Repository Metadata

**Repository description** (GitHub's "About" field):
```
AI-powered code review platform — GitHub OAuth, Gemini-powered PR/file analysis, inline GitHub comments, review history & analytics. MERN stack, deployed live.
```

**Website field:** `https://codelens-beige-two.vercel.app`

**Topics** (add via the gear icon next to "About" on the repo's main page):
```
ai  code-review  mern-stack  react  nodejs  mongodb  express  gemini-api
github-oauth  jwt  full-stack  developer-tools  llm  google-gemini
```