# Stock Portfolio

![Version](https://img.shields.io/badge/version-0.1.0-blue) ![Build Status](https://github.com/your-username/stock-portfolio/actions/workflows/ci.yml/badge.svg)

## Table of Contents

1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Available Scripts](#available-scripts)
5. [Project Scope](#project-scope)
6. [Project Status](#project-status)
7. [License](#license)

## Project Description

Stock Portfolio is an MVP web application for tracking the value of a personal stock portfolio. It enables a single long-term investor to:

- Manually log buy/sell transactions (symbol, date, quantity, price, currency).
- Define cash balances in USD, EUR, and PLN.
- Fetch real-time US stock prices and currency exchange rates.
- Calculate current position values, total portfolio value in a chosen currency, and profit/loss using the average cost basis.
- View a responsive dashboard with total value, historical charts (1H–Max), position table, and cash balances.
- See detailed pages for each stock, including transaction history and price charts.
- Receive automated daily, weekly, and monthly email summaries generated by AI (Openrouter.ai).

## Tech Stack

- **Frontend**: Next.js _(React 19, TypeScript 5, Tailwind 4, Shadcn/ui)_
- **Backend**: Supabase _(PostgreSQL, Supabase Auth, Supabase SDK)_
- **AI Summaries**: Openrouter.ai (OpenAI, Anthropic, Google models)
- **CI/CD**: GitHub Actions
- **Hosting**: Docker on DigitalOcean

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or Yarn
- A Supabase project (URL & anon/public key)
- An Openrouter.ai API key

### Clone & Install

```bash
git clone https://github.com/your-username/stock-portfolio.git
cd stock-portfolio
npm install
# or
yarn install
```

### Environment Variables

Create a `.env.local` in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Run in Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

In the project directory, you can run:

- `npm run dev` / `yarn dev`
  Starts the development server with Turbopack.
- `npm run build` / `yarn build`
  Builds the app for production.
- `npm run start` / `yarn start`
  Runs the built app in production mode.
- `npm run lint` / `yarn lint`
  Runs ESLint checks.

## Project Scope

This MVP includes:

- Supabase Auth for user registration and login.
- Manual buy/sell transaction entry with validation.
- Cash balance management (USD, EUR, PLN).
- Integration with market API for US stock prices & FX rates.
- Core calculations: position value, total portfolio value, profit/loss.
- Responsive dashboard: total value, multi-interval chart, positions table.
- Stock detail pages: transaction history and price charts.
- Automated AI-powered email summaries (daily, weekly, monthly).

Excluded from MVP:

- Importing transactions from external files or broker APIs.
- Live trading or order execution.
- Dividend handling or transaction fees.
- Social features or multi-user sharing.
- Native mobile apps (only responsive web).

## Project Status

- **Version**: 0.1.0 (MVP)
- **CI/CD**: Configured with GitHub Actions
- **Deployment**: Dockerized for DigitalOcean

## License

_License information not provided._
Please add a `LICENSE` file or update this section with the appropriate license for your project.
