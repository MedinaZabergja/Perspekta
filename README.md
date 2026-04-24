# Perspekta

Perspekta is a gentle reflection app for working through difficult thoughts, stepping away for a cooldown period, and revisiting old reflections after 30+ days.

## Stack

- Vite + React
- Supabase Auth
- Supabase Edge Function for app-state storage
- A lightweight key-value table used by the edge function

## Local Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Current Auth Model

- Sign-in now uses real Supabase password auth.
- Signed-in app data is keyed by the authenticated Supabase user id.
- Anonymous users still use a browser-local fallback id until they sign in.
- Older email-only buckets from the previous fake-login implementation are intentionally ignored.

## Important Supabase Note

The frontend in this repo now expects the edge function to verify Supabase JWTs and resolve the authenticated user id from the token.

That verification code lives in:

- [supabase/functions/make-server-498ba2c0/index.ts](supabase/functions/make-server-498ba2c0/index.ts)

If you want the live backend to enforce auth the same way as the updated frontend, deploy the function after logging into the Supabase CLI:

```bash
npx supabase login
npx supabase functions deploy make-server-498ba2c0 --project-ref sfsxstvnjycbqqiuongh --use-api
```

## Main App Behavior

- Reflections trigger a 4-hour cooldown.
- `Finish Reflection Early` only appears on the reflection-mode screen.
- The home CTA shows a countdown during cooldown and cannot start a new reflection.
- Past reflections only become visible after 30 days.
- Fear Jar entries are stored in the shared backend app state.
