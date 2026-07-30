# CodeLens — 30-Day Growth Plan

*Turning the v1.0.0 MVP into a significantly more complete product. One milestone per day, each building on the last.*

Use this alongside `daily-build-prompt.md` — paste that prompt each day, just updating the day number.

---

## Week 1: Reliability & Test Coverage (Days 1–7)

| Day | Milestone |
|---|---|
| 1 | Set up Jest + Supertest for the backend. Write tests for `requireAuth` middleware and `generateToken.js` — the security-critical core. |
| 2 | Test coverage for `aiReviewService.js`'s parsing/retry/validation logic using mocked Gemini responses (valid JSON, malformed JSON, schema-violating JSON). |
| 3 | Test coverage for all `review.routes.js` endpoints (mocked DB + mocked GitHub/AI services) — validation edge cases, auth checks, ownership checks on history/publish routes. |
| 4 | Set up React Testing Library. Tests for `FindingsList`'s category grouping and `useApiData`'s loading/error/data states. |
| 5 | Add a GitHub Actions CI workflow: run backend + frontend tests automatically on every push to `main`. |
| 6 | Fix whatever the new test suite actually surfaces (there will be at least one real edge case you didn't know about). |
| 7 | Add `connect-mongo`-free health monitoring: a `/api/health` check that also verifies DB connectivity, not just server uptime — useful once you add uptime monitoring later. |

## Week 2: Eliminate the Cold-Start & Harden Further (Days 8–14)

| Day | Milestone |
|---|---|
| 8 | Research and set up a free uptime-ping service (e.g., UptimeRobot or cron-job.org) hitting `/api/health` every 10 minutes to keep Render's instance warm. |
| 9 | Add structured logging (e.g., `pino`) replacing raw `console.error` calls, with log levels — groundwork for real observability later. |
| 10 | Add a `robots.txt` and `sitemap.xml` to the frontend for basic SEO discoverability. |
| 11 | Expand rate limiting: per-user (not just per-IP) limits on the AI review endpoints, using the authenticated `userId` as the key. |
| 12 | Add request/response logging middleware (dev-only, toggled by `NODE_ENV`) to make future debugging faster. |
| 13 | Security pass #2: run `npm audit` on both client and server, resolve anything genuinely actionable (skip anything requiring a breaking major-version bump without testing first). |
| 14 | Write and publish a real demo video (if not already done Day 10) — this is also a natural checkpoint to record "before" footage for comparison later in the month. |

## Week 3: Private Repos & Provider Expansion Groundwork (Days 15–21)

| Day | Milestone |
|---|---|
| 15 | Design the private-repo consent flow: what exact scope change is needed, what the UI disclosure should say, what changes (if any) to data retention policy this implies. Write it up before touching code. |
| 16 | Implement the OAuth scope change (`repo` instead of `public_repo`), gated behind an explicit opt-in toggle in the UI — never silently expand access. |
| 17 | Update `githubService.js` to handle private repos correctly in the repo-listing and PR-listing calls (mostly already works — verify explicitly with a real private test repo). |
| 18 | Add a visual "Private" badge on repo cards, and update the PRD-derived docs (`SCHEMA.md`/`API.md`) to reflect the new scope. |
| 19 | Begin abstracting `githubService.js` into a generic `gitProviderService` interface — start with just renaming/restructuring, no new provider yet. |
| 20 | Stub out a `gitlabService.js` skeleton implementing the same interface shape (repos, PRs, PR files) — doesn't need to work yet, just prove the interface holds. |
| 21 | Write `PROVIDER-ABSTRACTION.md` documenting the interface contract for future providers — useful both for you and for anyone who forks this later. |

## Week 4: Team Features & Model Flexibility (Days 22–30)

| Day | Milestone |
|---|---|
| 22 | Design a minimal "Team" concept in `SCHEMA.md`: a `Team` model, `teamId` added to `Review`, decide what "shared history" actually means (read access? aggregate stats only?). |
| 23 | Implement the `Team` model and a simple "create/join team" flow (invite by email or shareable code — keep it minimal). |
| 24 | Update `GET /review/history` to optionally scope by team instead of just individual user, with clear access control. |
| 25 | Add a settings toggle for "review focus" (e.g., security-only, or skip code-quality nitpicks) — parameterize the existing prompt in `aiReviewService.js` rather than writing a second prompt. |
| 26 | Add a model-choice setting (Gemini vs. a documented fallback) in user settings, stored per-user, read by `aiReviewService.js` at call time. |
| 27 | Extend `Analytics.jsx`/`GET /review/analytics` to support team-scoped aggregation (building on Day 24's team model) — this is the actual "team analytics" feature from `future-scope.md`'s 6-month plan, pulled forward. |
| 28 | Full regression pass: re-run the Day 8/9 manual test checklists against everything built this month — team flows, private repos, model switching. |
| 29 | Update `README.md`, `ARCHITECTURE.md`, and `SCHEMA.md` to reflect a month of real changes — don't let documentation drift from reality. |
| 30 | Tag a `v1.1.0` release on GitHub with real release notes summarizing the month's work — same process as Day 10's `v1.0.0`, now with a second real release under your belt. |

---

## How to Use This Plan

Each day assumes the previous day's milestone is genuinely done, not just started — if a day runs long, it's better to finish it properly and shift the rest of the month by a day than to move on with something half-working. This mirrors exactly how the original 10-day build handled scope pressure (Day 8's stretch-goal reordering, Day 4's blueprint-vs-reality reconciliation) — a realistic plan bends without breaking.