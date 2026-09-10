# SkyCrash

A free, open-source practice version of the classic crash-multiplier game, built with Next.js 16.

There is no real money anywhere in this app: no packages, no payments, no gated "signals." Every visitor
gets virtual demo credits and can play immediately.

## Features

- Landing page explaining how the game works and why crash points can't be predicted
- Live crash dashboard with an animated multiplier graph, a proper biplane, and a crash sequence
- Deterministic round and multiplier generation with rare "mega" crash rounds
- Virtual balance — demo bets are deducted and payouts are credited back, no real currency involved
- Simulated activity feed (clearly labeled) for atmosphere only
- Admin panel to start/stop the demo game and cap the max multiplier
- Neon/Postgres database for admin auth and game settings, with query caching
- API rate limiting
- Tailwind CSS v4 styling

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Neon (Postgres via @neondatabase/serverless)
- ESLint 9

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` - Neon Postgres connection string
- `ADMIN_EMAIL` - the only email allowed to log into `/admin`

3. Set up the database schema. The schema is available in `src/lib/neon-schema.sql`.

4. Run the development server:

```bash
npm run dev
```

5. Open http://localhost:3000

## Scripts

- `npm run dev` - start the development server
- `npm run build` - build for production
- `npm run start` - start the production server
- `npm run lint` - run ESLint

## Project Structure

```
src/
  app/           App Router pages (home, dashboard, admin, api)
  components/    Reusable UI components
  lib/           Database, rate limiting, and utilities
```
