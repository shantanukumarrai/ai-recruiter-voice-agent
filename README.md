# AI Recruiter Voice Agent

**Live Demo:** https://ai-recruiter-voice-agent-1f2v54y4e.vercel.app/

An end-to-end AI-powered recruitment platform. Recruiters post jobs, upload candidate resumes, and let AI handle parsing, ranking, voice interviews, and evaluation — all backed by a real database, real AI, and real email delivery.

---

## ✨ Features

### Recruiter Workflow
- **Authentication** — Clerk-based sign up/sign in (email + Google), protected dashboard, Clerk webhook keeps the app's `User` table in sync
- **Dashboard** — real-time stat cards (Total Jobs, Candidates, Scheduled/Completed Interviews), recent activity feed, candidates-per-job chart
- **Job Management** — create, edit, publish, close, and delete job postings with full validation
- **Candidate Management** — drag-and-drop resume upload (PDF/DOCX), AI-powered parsing extracts name, email, phone, skills, experience, education, and projects automatically
- **Resume Ranking** — AI scores each resume against the job description (overall score, skill/experience/education match, strengths & weaknesses)
- **Email Invitations** — branded interview invite emails sent via Resend, each with a unique, secure interview link
- **AI Voice Interview** — candidates take a live, spoken interview with an AI interviewer that asks dynamic, resume-aware questions across 8 stages (greeting → identity check → introduction → technical → follow-up → behavioral → cross-question → conclusion)
- **AI Evaluation** — automatically scores completed interviews on Communication, Confidence, Problem Solving, Technical Skill, Behavior, and Leadership, plus an overall hiring recommendation
- **Interview Reports** — one-click PDF and Markdown report generation with score charts, summary, and full transcript
- **Recruiter Notes** — private, timestamped notes per candidate
- **Analytics** — hiring funnel, interview completion rate, candidates-per-job, and top-skills charts
- **Notifications** — in-app notification bell + email notifications for invites, completed interviews, shortlists, and rejections
- **Shortlist / Reject / Hire** — one-click pipeline stage transitions with automatic notifications
- **Admin Panel** — role-gated, platform-wide view of every recruiter, job, and candidate
- **Dark Mode** — full light/dark theming throughout

### Candidate Experience
- Public, no-login interview link
- Natural spoken conversation (browser text-to-speech + Whisper transcription)
- Resumable session — refreshing the page picks up where they left off

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS, shadcn-style UI components |
| Auth | Clerk |
| Database | PostgreSQL (Neon), Prisma ORM |
| File Storage | UploadThing |
| AI (LLM) | Groq (Llama 3.3 70B) — resume parsing, ranking, interview questions, evaluation |
| Speech-to-Text | Groq-hosted Whisper (large-v3-turbo) |
| Text-to-Speech | Browser Web Speech API |
| Email | Resend + React Email |
| PDF Generation | pdfkit |
| Charts | Recharts |
| Deployment | Vercel |

---

## 🏗️ Architecture

```
UI (Server/Client Components)
   ↓
Actions (Server Actions — thin, validate + call services)
   ↓
Services (business logic — parsing, scoring, interview orchestration)
   ↓
Lib (clients: prisma, groq, uploadthing, resend)
   ↓
Prisma → PostgreSQL
```

- **Actions never talk to Prisma directly** — they call a service, keeping business logic testable and reusable.
- **Zod validators** are the single source of truth for data shape on both client forms and server actions.
- Every list/detail page ships with **loading, empty, and error states**.
- All recruiter-facing queries are **scoped by `recruiterId`** at the service layer — not just hidden in the UI — so one recruiter can never read or modify another's data.

---

## 📂 Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Sign in / sign up
│   ├── (dashboard)/      # Recruiter dashboard, jobs, candidates, interviews, analytics, admin
│   ├── interview/         # Public candidate-facing interview room
│   └── api/               # Webhook & upload route handlers
├── actions/              # Server Actions (thin, auth + validation)
├── services/              # Business logic, all DB access
├── validators/             # Zod schemas
├── components/             # UI (shadcn primitives + feature components)
├── lib/                     # Clients: prisma, groq, resend, uploadthing, auth
├── emails/                   # React Email templates
└── reports/                   # PDF report generation
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Set up environment variables
```bash
cp .env.example .env
```

Fill in every value:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Neon Postgres (use the **pooled** connection string for `DATABASE_URL`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → endpoint `POST /api/webhooks/clerk` |
| `GROQ_API_KEY` | console.groq.com — free tier, no card required |
| `UPLOADTHING_TOKEN` | uploadthing.com → API Keys |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | resend.com |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL (or `http://localhost:3000` locally) |

### 3. Run the database migration
```bash
npm run prisma:migrate -- --name init
```

### 4. Run the app
```bash
npm run dev
```
Visit `http://localhost:3000`.

### 5. Become an admin (optional)
```bash
npx prisma studio
```
Open the `User` table and change your `role` from `RECRUITER` to `ADMIN` to unlock `/admin`.

---

## ☁️ Deployment

Deployed on **Vercel**. Notes for anyone redeploying:

- Set `installCommand` to `npm install --legacy-peer-deps` in `vercel.json` (Clerk's peer dependency range can trip up Vercel's stricter resolver).
- `next.config.js` marks `pdfkit` as a `serverExternalPackage` — required for PDF report generation to work in the serverless environment.
- Add every variable from `.env` to **Vercel → Settings → Environment Variables**, and set `NEXT_PUBLIC_APP_URL` to your production URL (needed for interview links in emails to resolve correctly).

---

## 📄 License

No license specified.
