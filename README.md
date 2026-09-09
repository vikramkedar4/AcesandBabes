# Aces & Babes

A couples ELO platform. Two people link accounts to form a couple, log matches
against other couples across ten game categories, and climb a shared
leaderboard. ELO only moves when the opposing couple confirms a result.

Static HTML + vanilla JS on the front end, [Supabase](https://supabase.com)
(Postgres + Auth) on the back end. No build step.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Landing page with live leaderboard and stats |
| `signup.html` | Create an account (username, email, password) |
| `login.html` | Sign in |
| `dashboard.html` | Invite/accept a partner, log matches, confirm results, see history |
| `assets/styles.css` | Shared stylesheet |
| `assets/app.js` | Supabase client, helpers, shared queries |
| `supabase/schema.sql` | Tables, Row Level Security, triggers, and the RPC functions the app calls |

## Setup

1. **Run the schema.** Open your Supabase project → SQL Editor, paste the whole
   of `supabase/schema.sql`, and run it. It is safe to run more than once and
   safe to run on the existing project: it adds missing columns, replaces the
   functions, and rewrites the policies.

2. **Check the key.** `assets/app.js` holds the project URL and the public
   (anon / publishable) key. That key is meant to be in the browser; Row Level
   Security protects the data. If sign-in fails with an API-key error, copy
   the current key from Supabase → Project Settings → API and paste it in.

3. **Set the site URL.** Supabase → Authentication → URL Configuration. Set
   *Site URL* to where the site is hosted so confirmation links land on it.
   If *Confirm email* is on, new players get an email and must click it
   before logging in. The signup page handles both modes.

4. **Host the files.** Any static host works (GitHub Pages, Netlify, Vercel,
   Cloudflare Pages). All links are relative, so the site can live at a
   domain root or in a sub-folder. Filenames are lowercase; hosts are
   case-sensitive.

## How the game loop works

1. Both partners sign up. A profile row is created automatically.
2. One partner enters the other's username on the dashboard → a *pending*
   couple. The other partner sees the invite and accepts. Couple starts at
   1200 ELO.
3. Either partner logs a match: game, an opponent's username, won or lost.
   The match is *pending*.
4. Either member of the opposing couple confirms or rejects it on their
   dashboard. On confirm, `confirm_match()` in Postgres applies standard ELO
   (K = 32) to both couples in one transaction and records the delta.
5. The leaderboard ranks active couples by ELO.

All writes to `couples` and `matches` go through `security definer` RPC
functions, so nobody can set their own ELO from the browser.

## Local development

Serve the folder with any static server and open `index.html`:

```
python3 -m http.server 8080
```

The pages load supabase-js from jsDelivr, so you need internet access.

## Not done yet

- Password reset (needs a reset page wired to Supabase's recovery redirect)
- Per-game ELO; today one rating covers all categories
- Public couple profile pages
