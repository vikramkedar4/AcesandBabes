# CLAUDE.md — V Kedar's Command Center (formerly Aces & Babes)

## Read this first

This repo is being repurposed. It began as **Aces & Babes**, a couples ELO
ranking app (static HTML + Supabase). On 2026-09-10 Vikram decided to pivot
it into **V Kedar's Command Center**: a personal site whose main job is a
video repository showing the evolution of the short videos he has been
making with Claude in other chats.

The ELO app is finished and tested on branch
`claude/betrivers-betting-access-kcgzlh` (commit 845296a). It is NOT merged
to main. The Command Center replaces it as the live site; keep or drop the
ELO code as Vikram decides.

## What exists in the repo

| Path | What it is |
| --- | --- |
| `index.html`, `login.html`, `signup.html`, `dashboard.html` | ELO app pages |
| `assets/styles.css` | Shared stylesheet, dark + gold brand, CSS variables at the top |
| `assets/app.js` | Supabase client + helpers (`AB.esc` for HTML escaping) |
| `supabase/schema.sql` | ELO database. Only relevant if the new site keeps a login |
| `README.md` | ELO app docs |

## The pivot: what to build

1. Rebrand everything to **V Kedar's Command Center**.
2. A video library: grid of clips with title, date, which chat or project
   made it, tags; a player; search and filter; a chronological "evolution"
   view (oldest to newest) since that is the point of the site.
3. Data-driven. One manifest, `videos/videos.json`, one entry per video, so
   adding a video means adding a file and a JSON row, never editing HTML.
4. Keep the dark + gold look and the existing CSS tokens unless told
   otherwise.
5. Landing page stays static and hosted where it is today (see Hosting).

Suggested manifest entry:

```json
{
  "id": "2026-05-29-first-short",
  "title": "First generated short",
  "date": "2026-05-29",
  "source": { "file": "videos/2026-05-29-first-short.mp4" },
  "madeIn": "YouTube Shorts video generation",
  "tags": ["shorts", "test"],
  "notes": ""
}
```

`source` is one of `{ "file": "videos/x.mp4" }`, `{ "youtube": "VIDEO_ID" }`,
or `{ "drive": "DRIVE_FILE_ID" }`. Support all three in the player.

## Where the videos are

- On Vikram's Mac, produced in other Claude chats (sidebar names include
  "YouTube Shorts video generation", "Low-budget YouTube shorts",
  "YouTube Shorts production system"). A cloud session cannot see them.
  A local session on the Mac can. Ask Vikram for the folder.
- Two are already in Google Drive, folder id
  `1aIcIbWpZ5Hj8-0b7jUqX5JUvZgiwAl7T`, UUID-named mp4s of 2 to 3 MB each.

## Hosting the videos: decide by size

- **Small clips** (a few MB each, total under roughly 300 MB): commit them
  to `videos/` in this repo. GitHub Pages serves them fine. Keep every file
  under 100 MB. Do not use Git LFS; Pages will not serve LFS files.
- **Bigger or many**: upload to YouTube as unlisted and store the video id,
  or use a Supabase Storage bucket (the project already exists; URL and
  public key are in `assets/app.js`) and store the public URL.
- Never commit a file over 100 MB. GitHub rejects it.
- Re-encode oversized clips before committing:
  `ffmpeg -i in.mov -vcodec libx264 -crf 26 -preset slow -acodec aac -movflags +faststart out.mp4`

## Working from the Mac: first-time setup

```
brew install gh && gh auth login
git clone https://github.com/vikramkedar4/AcesandBabes.git
cd AcesandBabes
git fetch origin
git checkout claude/betrivers-betting-access-kcgzlh
python3 -m http.server 8080      # preview at http://localhost:8080
```

Find out where acesandbabes.com is served from (GitHub repo → Settings →
Pages, or a Netlify/Vercel dashboard) and record it here:

HOSTING: unknown as of 2026-09-10

## Conventions

- Static site, no build step, no framework. Lowercase filenames, relative
  links so the site works at a domain root or in a subfolder.
- Escape every data string before inserting it into HTML.
- Commit messages: imperative mood, say why.
- Work on a branch and open a PR. Do not push to main unless Vikram says so.
- Check the site at 400px width as well as desktop.

## Open questions for Vikram

- Public, or behind the existing Supabase login?
- Only videos, or also links, notes, and the HTML artifacts he has published?
- Where is the site hosted?
- Which local folder holds the videos?
