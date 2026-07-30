# CodeLens — Daily Build Prompt (30-Day Growth Plan)

*Paste this each day, updating only the day number. Keep everything else identical throughout the month.*

---

```
Day [N] of the CodeLens 30-Day Growth Plan.

Today is Day [N], continuing our work on CodeLens. Read the 30-day-growth-plan.md
file and use it as the source of truth for what's scheduled today. Also review
ARCHITECTURE.md, SCHEMA.md, API.md, and PROJECT-STRUCTURE.md so you have full
context on everything built so far — do not redesign or rebuild anything that
already works.

Build only today's scheduled milestone. If today's milestone depends on a
previous day's work that turns out to be incomplete or broken, stop and tell
me before proceeding — do not build on top of broken foundations.

Standing rules, same as the original 10-day build:
- Whenever I need to perform a manual step (installing packages, configuring
  a service, running a command, deploying, etc.), stop and give me exact
  step-by-step instructions using real button names, menu names, and terminal
  commands. Wait for my confirmation before continuing.
- Prioritize implementation over explanation — generate complete,
  copy-pasteable files, not snippets or placeholders.
- Clearly state whether each file is new or replaces an existing one, and
  exactly where it belongs.
- If today's work requires many files, package them clearly and explain
  exactly how to apply them.
- Pause after major milestones, UI changes, or whenever debugging is needed.
- If anything breaks, help me debug it completely before moving forward.
- Use only free-tier tools, APIs, and services unless I explicitly approve
  a paid one.
- Assume I have the experience level I've demonstrated so far in this
  project, not zero experience — but still explain new concepts I haven't
  encountered before in this build.

When today's work is complete:
- Verify it works (locally, and live if it's a deploy-affecting change).
- Update any documentation affected (ARCHITECTURE.md, SCHEMA.md, API.md,
  PROJECT-STRUCTURE.md, or README.md as relevant).
- Help me commit and push with a meaningful commit message.
- Give a concise summary of what was completed today and what tomorrow's
  milestone will be, based on 30-day-growth-plan.md.

Your goal is not just to add a feature. Your goal is to help me finish
today's milestone correctly, keep the project's documentation honest and
current, and leave every day's work in a genuinely working, committed state
before moving to the next day.
```

---

## Notes on Using This Prompt

- Replace `[N]` with the actual day number (1 through 30) each time.
- If a day's milestone in `30-day-growth-plan.md` gets modified or reordered as real work reveals new information, update that file first — this prompt always defers to whatever the plan document currently says, the same relationship the original 10-day Blueprint had with each day's build session.
- If a day is skipped (life happens), just resume with the same day number next time rather than skipping ahead — the plan is sequential and each day assumes the previous one is genuinely finished.