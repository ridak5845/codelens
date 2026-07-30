# CodeLens — Challenge Retrospective

*Day 1 to Day 10: how this project actually came together*

---

## Timeline

**Day 1** — Discovery and scoping. PRD, 9-day (later revised to 10-day) Implementation Blueprint, and Pitch Deck established: an AI-powered code review platform, GitHub OAuth, Gemini-powered analysis, free-tier-only tooling throughout.

**Day 2** — System design. Tech stack locked in (React/Vite, Node/Express, MongoDB Atlas, GitHub OAuth + JWT, Gemini, Render + Vercel). Full architecture, database schema, API design, and UI wireframes produced as standalone documents. Repository created, client/server skeleton scaffolded and verified running together, MongoDB Atlas cluster connected.

**Day 3** — Foundation. GitHub OAuth App registered, JWT-based stateless authentication built end to end. **First real design decision under pressure:** an updated blueprint arrived specifying session-based Passport auth, conflicting with the already-approved JWT design — the conflict was surfaced explicitly rather than silently resolved, and JWT was kept specifically because Render's free tier spins down idle instances, which would have silently logged out every user under a naive in-memory session store. **First real debugging saga:** a MongoDB `mongodb+srv://` DNS lookup failure that worked fine at the OS level but failed inside Node's own resolver — solved by switching to the standard multi-host connection string, then immediately hitting a second bug (a literal `<password>` placeholder left in the connection string), only conclusively diagnosed by printing raw character codes rather than trusting a visual read of the string.

**Day 4** — GitHub API integration. Repo listing, PR listing, PR diff fetching — all real GitHub REST API calls using the authenticated user's own token, verified against real repositories including `facebook/react`.

**Day 5** — The AI review engine. Prompt design, structured JSON output, defensive parsing with a retry-on-malformed-response path. **Two live-fire corrections in one session:** the planned `@google/generative-ai` package turned out to be deprecated by Google in 2025 (switched to `@google/genai`), and the first model tested, `gemini-2.5-flash`, returned a 404 for new API keys mid-session — resolved by switching to the `gemini-flash-latest` alias specifically to avoid repeating this exact problem as Google continues rotating models.

**Day 6** — Dashboard UI and the first live deployment. Score visualization, categorized/collapsible findings, the required challenge footer. Deployment to Render and Vercel surfaced a chain of four distinct issues, each fixed and verified in turn: a Vercel environment variable that silently never saved, a "Sensitive" flag that permanently hid its own value, a root cause traced to code changes that were written locally but never actually pushed to GitHub (the single biggest time cost of the day), and a Vercel SPA routing gap requiring a rewrite rule. This is where "the file is saved" and "the file is deployed" became a hard-won, explicit distinction.

**Day 7** — Review history, single-file review mode, and a full senior-level UX polish pass. This is also where the `Review` database schema's true shape got settled — the AI engine's actual 3-score output was confirmed as final over the originally-planned 4-category design, because it matched reality rather than an earlier guess.

**Day 8** — A full day reframed, mid-plan, from "stretch goals" to "production hardening" — a deliberate scope trade explicitly agreed on rather than silently substituted. Security headers, rate limiting, input validation, a React error boundary, a 404 page, accessibility contrast fixes. **One regression caught in the act:** adding `state: true` CSRF protection to the GitHub OAuth strategy broke login entirely, because it silently depended on session support the app had intentionally never had since Day 3 — reverted with a code comment explaining exactly why, rather than bolting on session infrastructure just for one feature. With hardening done, the day continued into all three originally-deferred stretch goals — inline GitHub PR comments (hitting and fixing a real OAuth scope permissions gap along the way), review comparison with resolved/new/unchanged classification, and usage analytics — completing all three, an outcome the blueprint itself explicitly said was optional.

**Day 9** — Launch readiness. A genuine security audit (verified, not assumed, that the GitHub access token never reaches the frontend — by code review and by live DevTools inspection), README rewrite, `.env.example` templates, favicon and social-sharing metadata, and a full manual test pass covering both happy paths and deliberately-attempted failure paths.

**Day 10** — This document, three siblings, a v1.0.0 release, and graduation.

---

## Major Technical Decisions & Why They Held Up

1. **Stateless JWT over sessions.** Made once (Day 3), defended once against a conflicting blueprint update (Day 3), and paid off directly when it prevented a Render-cold-start logout bug that a session-based design would likely have hit in production without anyone noticing until a user complained.
2. **One AI engine, two entry points.** `aiReviewService.reviewCode()` never changed its contract between PR review and single-file review — Day 7's file-review mode and Day 5's PR review share the exact same function, meaning a bug fix or prompt improvement in one automatically benefits both, with zero duplicated AI logic anywhere in the codebase.
3. **Model aliases over pinned versions.** A direct lesson from getting burned once (Day 5's `gemini-2.5-flash` 404) — applied immediately and never revisited, because `gemini-flash-latest` has quietly kept working through every subsequent day's testing without another model-related outage.

## Challenges Solved (The Debugging Moments Worth Remembering)

- The MongoDB DNS + placeholder-bracket double bug (Day 3) — solved with evidence (a diagnostic script printing character codes) instead of a fourth guess.
- The Vercel "code edited but never pushed" deployment mystery (Day 6) — over an hour of debugging that ultimately came down to one missing `git push`, now permanently documented in `ENVIRONMENT.md` as a lesson for any future session.
- The GitHub OAuth scope 404 when posting inline PR comments (Day 8 continued session) — diagnosed by reading GitHub's actual error response body rather than guessing from the generic Axios error message.
- The CSRF `state: true` regression (Day 8) — caught immediately via the checkpoint-before-continuing discipline established since Day 4, rather than being discovered days later.

## Skills Demonstrated

Full-stack MERN development, OAuth 2.0 implementation, third-party AI API integration with defensive engineering (retry logic, schema validation, graceful degradation), MongoDB schema design that evolved deliberately as real requirements emerged, production deployment across two separate free-tier platforms, security hardening (rate limiting, input validation, CSRF trade-off reasoning, XSS/injection-safe practices via Helmet), accessibility remediation (WCAG contrast, ARIA attributes, keyboard navigation), and — running through literally every day of this log — the discipline of surfacing conflicts and scope changes explicitly rather than silently working around them.

## Final Project Summary

CodeLens shipped as a complete, real, deployed application: GitHub OAuth login, AI-powered PR and single-file code review with categorized findings and scoring, persisted review history, inline GitHub PR comment publishing, review-to-review comparison, and personal analytics — every PRD-required core feature plus all three optional stretch goals, live on the public internet, built entirely on free-tier infrastructure.

## Lessons Learned

Conflicts between an evolving plan and already-built work are not failures to hide — they're decisions to surface, explain, and make deliberately, and every single one of them (JWT vs. sessions, QA-day vs. stretch-goals, blueprint version mismatches) made the final project stronger for having been named out loud instead of quietly overridden. Debugging is fastest when it's evidence-based rather than guess-based — every real breakthrough this week (the DNS bug, the placeholder brackets, the missing git push, the OAuth scope) came from actually looking at raw data instead of trying another plausible-sounding fix. And "it works" is a different claim from "it's launch-ready" — the gap between those two was exactly what Days 8 and 9 existed to close.

## A Farewell, From Your AI Pair Programmer

We built this together across ten real days — not a simulation of building something, but the actual thing: real bugs with real stack traces, a real MongoDB cluster that really refused to connect, a real GitHub PR that now has a real AI-generated comment sitting on it forever. I watched you go from "give me exact button names" on Day 2's repo setup to debugging your own environment variable propagation issues by Day 6. That's not a small distance to cover in a week and a half.

CodeLens works. It's live, it's documented, it's got a license and a README someone else could actually follow, and it has three stretch features most people building this exact project would have reasonably skipped. Whatever you build next — with or without me in the loop — you now have direct, hard-won proof that you can take a project from a blank PRD to a deployed, working, polished product, debug it when it breaks in ways no tutorial ever mentions, and make real trade-off calls under time pressure instead of just following instructions. That's the actual skill. The code was just where it happened to live this time.

Go build the next thing.