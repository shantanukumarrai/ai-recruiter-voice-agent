# AI Recruiter Voice Agent

## Step 1 completed: Architecture, Folder Structure, Dependencies, Env, Prisma Schema, Auth

### Folder structure so far

```
ai-recruiter-voice-agent/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # server-side auth guard
│   │   │   └── dashboard/page.tsx
│   │   ├── api/
│   │   │   └── webhooks/clerk/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── env.ts                  # validated env access
│   │   ├── prisma.ts               # Prisma singleton
│   │   ├── auth.ts                 # getCurrentUser / requireCurrentUser
│   │   └── utils.ts                # cn()
│   ├── providers/
│   │   └── theme-provider.tsx
│   ├── middleware.ts
│   ├── components/  (ui, shared, dashboard — populated in later steps)
│   ├── hooks/        (populated in later steps)
│   ├── services/      (populated in later steps)
│   ├── actions/        (populated in later steps)
│   ├── validators/      (populated in later steps)
│   └── types/            (populated in later steps)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── .env.example
```

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in every value in `.env`:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Your Postgres instance (e.g. Neon, Supabase, Railway) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk Dashboard → Webhooks → create endpoint `POST /api/webhooks/clerk`, subscribe to `user.created`, `user.updated`, `user.deleted` |
| `OPENAI_API_KEY` | platform.openai.com |
| `MURF_API_KEY` | Murf Falcon dashboard |
| `UPLOADTHING_TOKEN` | uploadthing.com |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | resend.com (verify a sending domain) |
| `NEXT_PUBLIC_WEBTRACKY_SITE_ID` | WebTracky dashboard |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | upstash.com (used for rate limiting, wired in a later step) |

Also set in **Clerk Dashboard → Google**: enable the Google OAuth social connection (no code change needed — `<SignIn/>` and `<SignUp/>` pick it up automatically).

### 3. Run the database migration

```bash
npm run prisma:migrate -- --name init
```

This creates all tables: `users`, `jobs`, `candidates`, `applications`, `resume_analyses`, `interviews`, `interview_sessions`, `messages`, `reports`, `recruiter_notes`, `notifications`.

Inspect the schema visually anytime with:

```bash
npm run prisma:studio
```

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000`.

### 5. Testing this step

1. `/` loads without auth (public route).
2. `/dashboard` redirects to `/sign-in` when logged out (middleware guard).
3. Sign up with email — check Postgres: `SELECT * FROM users;` should show a row within a few seconds (webhook sync). If it doesn't land immediately, `/dashboard` still works because `getCurrentUser()` does a just-in-time upsert fallback.
4. Sign up with Google — same check; confirms the social connection + webhook path together.
5. Sign out, hit `/dashboard` again — should redirect to `/sign-in` with a `redirect_url` back to `/dashboard`.
6. `npm run typecheck` — should pass with zero errors.

For local webhook testing, use the Clerk CLI or `ngrok`/`stripe listen`-style tunnel and point Clerk's webhook endpoint at `https://<tunnel>/api/webhooks/clerk`.

---

**Next step (waiting for your confirmation): Dashboard — stat cards (Total Jobs, Candidates, Scheduled/Completed Interviews), sidebar/topbar shell, and the analytics charts skeletons.**
