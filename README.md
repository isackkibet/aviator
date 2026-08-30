# Aviator Signals

Next.js 16 platform for live Aviator crash-game signals. Users buy signal packages, pay via M-Pesa, and unlock betting access to an animated live dashboard with real-time crash predictions.

## Features

- Landing page with hero, how-it-works, platforms, and testimonials sections
- Live Aviator crash dashboard with animated multiplier graph, plane and crash effects
- Deterministic round and multiplier generation with rare "mega" crash rounds
- Live multiplayer bet feed, top wins, and floating win popups
- Gated betting access: signals unlock after purchasing a package
- Package checkout (Basic, Pro, VIP) with phone number capture
- Payment integration with create, verify, webhook, and success flows
- Admin panel for managing settings, signals, and access
- Neon/Postgres database with query caching
- API rate limiting
- Tailwind CSS v4 styling

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Neon (Postgres via @neondatabase/serverless)
- M-Pesa payment integration
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
- M-Pesa / payment credentials

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
  app/           App Router pages (home, dashboard, packages, payment, admin, api)
  components/    Reusable UI components
  lib/           Database, rate limiting, and utilities
  types/         Shared TypeScript types
```
