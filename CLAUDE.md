# CLAUDE.md — V Kedar's Command Center

## What this is

A personal video archive site for V Kedar (Vikram): every video he has been
making with Claude in other chats, catalogued in the order it happened.
Static HTML, no build step, no backend. Videos are hosted on YouTube; the
site is the catalogue and player.

History: this repo began as "Aces & Babes", a couples ELO app on Supabase.
That version is complete and tested at commit 845296a on this branch, and
was replaced on 2026-09-10 by the Command Center. Do not bring it back
unless asked. The domain (acesandbabes.com) stays.

## Files

| Path | What it is |
| --- | --- |
| `videos/videos.js` | The video manifest. `window.COMMAND_CENTER = { owner, tagline, defaultAspect, videos: [...] }`. The only file that changes when a video is added |
| `index.html` | The page. Element ids are referenced from app.js; keep them in sync |
| `assets/app.js` | Parses the manifest, renders stats, filters, grid, timeline, player. Exposes `window.CC` for tests |
| `assets/styles.css` | Dark + gold brand. Tokens at the top |
| `CNAME`, `.nojekyll` | GitHub Pages config |
| `README.md` | Owner-facing docs: adding videos, DNS setup |

## Manifest entry

```js
{ title, youtube, date: "YYYY-MM-DD", project, tags: [], notes, aspect: "9:16" | "16:9" }
```
`youtube` accepts any YouTube URL form or a bare 11-char id. Alternatives:
`drive: "<link or id>"` or `file: "videos/x.mp4"`. Entries with none of the
three are hidden and listed in a notice on the page. Chronological number
(№) is assigned by date across all playable entries.

## Hosting

- **Domain:** GoDaddy. Free plan, no site published there. DNS only.
- **Site:** GitHub Pages from `main`, root folder, custom domain
  `acesandbabes.com`. DNS records are in README.md.
- As of 2026-09-10 Pages is NOT yet enabled and the DNS records are NOT
  yet set; Vikram has to do both (GitHub Settings → Pages; GoDaddy → DNS).
- **Videos:** YouTube. No video files in the repo unless small and
  deliberate; never commit a file over 100 MB.

## Conventions

- Static site, no framework, no build. Lowercase filenames, relative links.
- Escape every manifest string before it touches HTML (`esc` in app.js).
  The manifest is trusted-ish but titles come from YouTube and chats.
- Test at 400px width and desktop. No horizontal scroll.
- Commit messages: imperative, say why.
- Work on a branch; do not push to `main` unless Vikram says so.

## Testing

There is no test runner in the repo. The cloud session that built this
used a Playwright script against a fake manifest (routes `videos/videos.js`
and thumbnail hosts) to check rendering, filters, sort, timeline grouping,
the player, deep links, escaping, and mobile width. Reproduce that approach
if you change app.js materially: `npm i -g playwright` is not needed on a
machine with Chrome, use `channel: 'chrome'`.

## Open items

- The manifest is empty. Vikram needs to supply YouTube links (or a
  channel/playlist URL) to populate it.
- Optional later: auto-pull from a YouTube playlist via the Data API; an
  add-video form behind login; non-video sections.
