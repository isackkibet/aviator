# Aviator Signals - Kenyan Betting Site 🚀

## Features
- Live Aviator crash signals (95% win rate demo)
- Packages: KSH100/10min → KSH2000/day
- Pro neon betting design


## Database (Neon / Postgres)
The app uses a Postgres database on [Neon](https://neon.tech).

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your Neon connection string (from the Neon console: **Connect** → **Connection string**).
2. Create the tables in the Neon **SQL Editor** by running the contents of `src/lib/neon-schema.sql`.
3. Create your first admin:
   ```
   node scripts/seed-admin.mjs
   node scripts/seed-admin.mjs "you@email.com" "yourpassword" "Your Name"
   ```

## How to Deploy Production
```
1. vercel login
2. vercel --prod
3. Add `DATABASE_URL` to your Vercel environment variables.
↓ https://your-aviator.vercel.app
```

## Live Preview
See the latest deployed site for review:
https://aviator-seven-omega.vercel.app/

## Test Local
```
npm run dev
localhost:3000/packages
```


## File Structure
```
src/app/
├── page.tsx (Landing)
├── packages/page.tsx (Buy)
├── dashboard/page.tsx (Signals)
└── api/
    ├── create-payment/route.ts (STK Push)
    └── webhook/route.ts (Callback)
```

**Aviator Signals – Ready to earn!** *(tweaked on isack1 branch)*

# Co-authored commit test
# Pull Shark achievement
test change
