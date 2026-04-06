# CLAUDE.md — Stock Portfolio

## Project Overview

Personal stock portfolio tracker (MVP v0.1.0) built with Next.js 15, React 19, TypeScript, Supabase (PostgreSQL + Auth + Edge Functions), and Tailwind CSS 4. Tracks buy/sell transactions, cash balances in multiple currencies (USD, EUR, PLN), fetches live market data, and sends AI-powered email summaries.

## Quick Reference

```bash
npm run dev              # Start Next.js dev server (Turbopack)
npm run dev:local        # Start Supabase + Edge Functions + Next.js together
npm run build            # Production build
npm run lint             # ESLint (next/core-web-vitals + next/typescript)
npm run start            # Start production server
npm run email:test       # Test daily email summary (local Supabase required)
```

## Project Structure

```
app/
├── (auth)/              # Auth route group: login, register
├── (dashboard)/         # Protected routes: portfolio dashboard
│   ├── _components/     # Dashboard-specific components (charts, tables)
│   ├── cash/            # Cash balance management pages
│   ├── stocks/[symbol]/ # Stock detail page with price chart
│   └── transactions/    # Transaction CRUD (add, edit/[id])
├── auth/                # Auth callback handler
├── layout.tsx           # Root layout
└── globals.css          # CSS variables, Tailwind theme

components/              # Shared components
├── ui/                  # Shadcn/ui primitives (button, card, form, input, etc.)
├── navbar.tsx           # Navigation bar
└── transaction-form.tsx # Reusable transaction form

lib/
├── market-data/         # Alpha Vantage (stock prices) + Frankfurter (FX rates)
├── portfolio/           # Portfolio calculations (cost basis, P/L, history)
├── validations/         # Zod schemas for form validation
└── utils.ts             # cn() helper (clsx + tailwind-merge)

utils/supabase/          # Supabase client initialization (server + browser)

supabase/
├── functions/           # Deno edge functions (email summaries)
├── migrations/          # SQL migrations (schema, RLS, cron)
└── config.toml          # Local Supabase config

db/database.types.ts     # Auto-generated Supabase types
.ai/                     # Product docs (PRD, DB schema, tech stack)
.cursor/rules/           # Cursor IDE coding guidelines
```

## Architecture & Conventions

### Server vs Client Components
- **Server components** (default): Pages and layouts that fetch data via Supabase directly. Use `async` functions.
- **Client components** (`'use client'`): Interactive UI — forms, charts, anything with hooks or browser APIs.
- **Server Actions** (`'use server'`): Defined in `actions.ts` files within route directories. Handle form submissions and data mutations.

### Data Flow Pattern
- Server components call Supabase directly: `const supabase = await createClient()`
- Client components invoke Server Actions for mutations
- After mutations, use `revalidatePath()` for cache invalidation and `redirect()` for navigation

### Form Handling
- Zod schemas in `lib/validations/` define validation rules
- React Hook Form with `@hookform/resolvers` (zodResolver) manages form state
- `TransactionForm` is the shared form component for add/edit flows

### Authentication
- Supabase Auth with email/password
- `middleware.ts` protects routes — redirects unauthenticated users to `/login`
- Public paths: `/login`, `/register`, `/auth/callback`

### Database
- PostgreSQL 15 via Supabase with Row-Level Security (RLS)
- `NUMERIC(15,4)` for monetary values — use native JS numbers in application code
- ENUMs: `transaction_type` ('buy', 'sell'), `currency_code` (USD, EUR, PLN)
- Migrations in `supabase/migrations/` — ordered by timestamp
- Generated types in `db/database.types.ts` — regenerate after schema changes with `supabase gen types`

### Market Data
- **Stock prices**: Alpha Vantage API (GLOBAL_QUOTE + TIME_SERIES_DAILY)
- **Exchange rates**: Frankfurter API (public, no key)
- **Caching**: 15-minute staleness window for real-time prices
- Daily price history stored and de-duplicated per calendar date

### Edge Functions (Deno)
- Located in `supabase/functions/send-portfolio-summary/`
- Runs on cron (daily/weekly/monthly) via pg_cron
- Uses Openrouter.ai for AI summary generation, Resend for email delivery
- Uses Supabase service role key to bypass RLS

### Styling
- Tailwind CSS 4 with utility-first approach
- CSS variables for theming in `globals.css`
- Shadcn/ui (New York style) for component primitives
- Use `cn()` from `lib/utils.ts` for conditional class merging

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ALPHA_VANTAGE_API_KEY
```

For edge functions:
```
OPENROUTER_API_KEY
RESEND_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Key Guidelines for AI Assistants

1. **Read before editing** — always read files before modifying them.
2. **Use Server Components by default** — only add `'use client'` when the component needs interactivity or browser APIs.
3. **Server Actions for mutations** — put data-modifying logic in `actions.ts` files with `'use server'` directive.
4. **Validate with Zod** — add/update schemas in `lib/validations/` for any new form inputs.
5. **Use Supabase client from `utils/supabase/`** — `server.ts` for server components/actions, `client.ts` for client components.
6. **Monetary precision** — database uses `NUMERIC(15,4)`; keep calculations consistent.
7. **No test framework yet** — testing infrastructure is not configured. Run `npm run lint` and `npm run build` to verify changes.
8. **Path alias** — use `@/` to import from project root (e.g., `@/components/ui/button`).
9. **Shadcn/ui components** — add new UI primitives via `npx shadcn@latest add <component>`, don't create from scratch.
10. **Migrations** — new SQL migrations go in `supabase/migrations/` with timestamp prefix format `YYYYMMDDHHMMSS_description.sql`.
