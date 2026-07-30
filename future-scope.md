# CodeLens — Future Scope

*How this specific project could evolve beyond v1.0.0*

---

## Next 3 Months: Solidify the Core

The goal here isn't new headline features — it's turning "works reliably for me" into "works reliably for anyone."

- **Private repository support.** The single biggest scope boundary in the current PRD. Requires expanding the GitHub OAuth scope from `public_repo` to `repo`, and a clear, explicit consent screen explaining exactly what that grants — private code review is a real use case, but it raises the stakes on token handling and deserves its own security pass, not a quiet scope bump.
- **Move off Render's free tier for the backend**, or add a lightweight "keep-alive" ping, to eliminate the ~50-second cold-start delay that's currently the single biggest UX rough edge for a first-time visitor.
- **Real test suite.** Today's testing has been entirely manual (thoroughly so — Day 8 and Day 9's checklists were genuinely comprehensive), but a portfolio project benefits from visible automated coverage: Jest/Supertest for the API routes, React Testing Library for the trickier components (`FindingsList`'s grouping logic, `useApiData`'s error states).
- **Webhook-triggered reviews.** Right now every review is user-initiated. A GitHub webhook that automatically reviews a PR the moment it's opened (opt-in, per-repo) would make CodeLens feel like a real bot teammate instead of a manual tool.
- **Diff-aware "Review Again."** The current comparison logic (Stretch Priority 2) re-reviews the *entire* current diff and matches findings after the fact. A more efficient version would fetch only the commits added since the last review and review the delta specifically — faster and cheaper on the Gemini quota.

## Next 6 Months: Broaden the Product

- **GitLab and Bitbucket support**, generalizing `githubService.js` into a provider-agnostic interface — the AI review engine (`aiReviewService.js`) already doesn't care where the diff came from, so this is mostly a `services/` layer expansion, not a rewrite.
- **Team/organization accounts.** Currently every review is scoped to one individual GitHub user. A "team" concept — shared review history, aggregate analytics across a small group — would open CodeLens to the small-team use case explicitly called out as a target user in the PRD, without the complexity of full enterprise role/permission management.
- **Configurable review depth/focus.** Let a user say "focus on security only" or "skip style/quality nitpicks" via a per-review or per-repo setting — the prompt in `aiReviewService.js` already has the structure to support this with a small parameterization.
- **Inline diff view in the app itself**, rather than only showing a 3-line excerpt per finding — a real side-by-side diff viewer (several open-source React diff components exist) would make findings easier to act on without tabbing over to GitHub.
- **Model flexibility.** Add a settings toggle to choose between Gemini and an alternative free-tier model (e.g., a GitHub Models-backed option, already documented as the Day 2 fallback plan) — useful both for redundancy if Gemini's free tier ever tightens further, and for users who want to compare outputs.

## Next 12 Months: Platform Maturity

- **Paid tier consideration** (if usage ever justifies it) — not to gate core review functionality, but to fund fixed backend hosting (eliminating cold starts entirely) and higher AI rate limits for power users, while keeping a genuinely useful free tier intact, in the spirit of the original PRD's accessibility goal.
- **Organization-wide analytics and trends**, building on Stretch Priority 3's single-user analytics — issue-category trends across a whole team's repos, useful for engineering managers tracking code health over time.
- **IDE integration** (VS Code extension) — reviewing a file without leaving the editor, reusing the exact same `/api/review/file` endpoint the web app already calls.
- **Auto-fix suggestions**, not just flagged issues — an opt-in "suggest a patch" feature per finding, using the same AI engine with a follow-up prompt. This is explicitly out of scope for v1.0 per the PRD, and should stay a deliberate, separate feature rather than silently creeping into the core review flow.

## What Won't Change

Regardless of how far this grows, a few decisions made during the 10-day build are worth keeping as principles, not just implementation details: stateless JWT auth over sessions (proven resilient to Render's cold starts), the "opt-in, never automatic" rule for anything that writes back to a user's real GitHub account (inline comments require explicit confirmation, and any future auto-fix feature should follow the same rule), and free-tier-first tooling choices that keep the barrier to entry low for exactly the solo developers and students the PRD identifies as the core audience.