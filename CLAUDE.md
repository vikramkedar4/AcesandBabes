# CLAUDE.md — V Kedar's Command Center

## What this is

A personal video archive site for V Kedar (Vikram): every video he has been
making with Claude in other chats, catalogued in the order it happened.
Static HTML, no build step, no backend. The videos are mp4 files committed
to this repo (**71 of them, ~615 MB, 3.1 hours, 22 series, as of 2026-09-12**);
the site is the catalogue and player.

**Never ingest** `~/Claude/family-portfolio-review` — private family material.
Also excluded on purpose: `the-leaving` and `244-days` (abandoned),
`refusal-engine/out/demo.mp4` (scratch-ledger render, not real data), and every
intermediate under `gen/`, `generations/`, `making/seg/`, `edit/` and `chunks/`.

History: this repo began as "Aces & Babes", a couples ELO app on Supabase.
That version is complete and tested at commit 845296a, and was replaced on
2026-09-10 by the Command Center. Do not bring it back unless asked. The
domain (acesandbabes.com) stays.

## Files

| Path | What it is |
| --- | --- |
| `videos/videos.js` | The video manifest. `window.COMMAND_CENTER = { owner, tagline, defaultAspect, videos: [...] }`. The only file that changes when a video is added |
| `videos/*.mp4`, `videos/posters/*.jpg` | The videos and one poster frame each |
| `scripts/ingest.py` | Adds a video from the Mac (copy, faststart remux or 720p re-encode, poster, ffprobe, manifest entry) |
| `index.html` | The page. Element ids are referenced from app.js; keep them in sync |
| `assets/app.js` | Parses the manifest, renders stats, filters, grid, timeline, player. Exposes `window.CC` for tests |
| `assets/styles.css` | Dark + gold brand. Tokens at the top |
| `README.md` | Owner-facing docs: adding videos, hosting |

## Manifest entry

```js
{ title, file: "videos/x.mp4", poster: "videos/posters/x.jpg", duration: 55,
  date: "YYYY-MM-DD" | "YYYY-MM-DDTHH:MM", seq, project, tags: [], notes, aspect: "9:16" | "16:9" }
```
`youtube` (any URL form or bare 11-char id) or `drive` can replace `file`.
Entries with none of the three are hidden and listed in a notice on the page.
Chronological number (№) is assigned by date, then `seq`, then title, across
all playable entries. The id used in `#v=` deep links is the file name without
`.mp4` (or the YouTube/Drive id). `scripts/ingest.py` inserts new entries above
the `// <<ingest:` marker line; keep that line.

## Where the videos come from

Every video is a copy of a render in a sibling project under `~/Claude/`
(the workspace index in `~/Claude/CLAUDE.md` lists them). Those projects are
the source of truth; this repo holds distribution copies. Re-ingest from the
project's `out/` after a re-render rather than editing files here.

## Hosting

- **Site:** Vercel, connected to this GitHub repo. `main` is production and
  deploys on push; other branches get preview URLs. There is no Vercel config
  in the repo and none is needed.
- **Domain:** GoDaddy, DNS already at Vercel (`A @ 76.76.21.21`). GoDaddy's
  own website builder is unpublished and must stay that way.
- **GitHub Pages is NOT used** (the 2026-09-10 cloud session assumed it would
  be; the domain was already on Vercel). Recovery steps are in README.md.
- Keep every file under 100 MB (GitHub's hard limit). `ingest.py` re-encodes
  anything over 40 MB at 720p.

## Conventions

- Static site, no framework, no build. Lowercase filenames, relative links.
- Escape every manifest string before it touches HTML (`esc` in app.js).
- Test at 400px width and desktop. No horizontal scroll.
- Commit messages: imperative, say why.
- Work on a branch; push to `main` only when Vikram says so (a push to
  `main` is a deploy).

## Testing

There is no test runner in the repo. Verify by serving the folder
(`python3 -m http.server 8080`) and checking in a browser: stats, both views,
project and tag chips, search, sort, the player (open, prev/next, Esc), deep
links (`#v=`, `#p=`), the 400px layout, and the console (no errors). The
2026-09-10 cloud session used a Playwright script against a fake manifest;
reproduce that approach if app.js changes materially.

## Open items

- Scratch narration on most Shorts is macOS Samantha; Vikram may re-render
  with his own read and re-ingest.
- `steelers-2500`'s valuation card needs a refresh before it is promoted.
- Optional later: YouTube mirror per video (`youtube:` alongside `file:` is
  not supported yet; the player uses the first of youtube/drive/file it finds).
- Optional later: gate the site behind a login if Vikram wants it private.
