# CodeLens

AI-powered code review for your GitHub pull requests — and any file you paste in, no PR required.

**Live app:** https://codelens-beige-two.vercel.app
**Built as part of the AB Talks 60-Day Claude AI Challenge**

---

## What It Does

CodeLens connects to your GitHub account and gives you instant, structured AI feedback on your code:

- **Sign in with GitHub** — OAuth login, no password to manage.
- **Browse your repos and pull requests** — pick any open PR and review it in one click.
- **AI-powered review** — categorized feedback (Bugs, Security, Performance, Code Quality), with exact file/line references and a real code excerpt for each finding.
- **Scoring** — Security, Performance, and Maintainability scores (0–100) for every review.
- **Single-file review** — paste code or upload a file, independent of any GitHub PR.
- **Review history** — every review is saved automatically and can be reopened anytime.
- **Post to GitHub** — publish the AI's findings as real inline comments directly on your PR, with a confirmation step.
- **Review comparison** — re-run a review on the same PR and see what's resolved vs. newly introduced, with score deltas.
- **Analytics** — your own findings-by-category breakdown and score trend across your review history.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, recharts |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Auth | GitHub OAuth (Passport.js) + JWT (HTTP-only cookie) |
| AI | Google Gemini API (`gemini-flash-latest`) |
| Hosting | Render (backend) + Vercel (frontend) — both free tier |

## Screenshots

See `/docs/screenshots` for the full walkthrough, or visit the [live app](https://codelens-beige-two.vercel.app) directly.

## Running Locally

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (free tier)
- A GitHub account (for OAuth)
- A Google AI Studio account (for a free Gemini API key)

### Setup

```bash
git clone https://github.com/ridak5845/codelens.git
cd codelens

cd server
npm install
cp .env.example .env   # then fill in real values — see below

cd ../client
npm install
cp .env.example .env   # default value works for local dev as-is
```

### Required Environment Variables (`server/.env`)

See `server/.env.example` for the full list with descriptions. In short, you'll need:
- A MongoDB Atlas connection string
- A GitHub OAuth App (create one at [github.com/settings/developers](https://github.com/settings/developers)) — Client ID + Secret
- A Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))
- A random JWT secret (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Run

```bash
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

Visit `http://localhost:5173`.

## Project Documentation

Full architecture, database schema, API reference, and day-by-day build log are in the repo root:

- `ARCHITECTURE.md` — system design, diagrams, request lifecycle
- `SCHEMA.md` — database schema
- `API.md` — full endpoint reference
- `UI-WIREFRAMES.md` — original UX wireframes
- `PROJECT-STRUCTURE.md` — annotated folder structure with build status
- `DAY3-SUMMARY.md` through `DAY8-SUMMARY.md` / `STRETCH-GOALS-SUMMARY.md` — day-by-day build log

## Known Limitations

- Free-tier hosting: the backend (Render) spins down after inactivity — the first request after idle time can take up to ~50 seconds.
- Gemini's free-tier responses aren't perfectly deterministic — identical code may occasionally receive slightly different findings between runs.
- Public GitHub repositories only, by design (see the PRD's scope).

## License

MIT — see `LICENSE`.