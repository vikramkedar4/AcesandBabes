# V Kedar's Command Center

A video archive of everything V Kedar has been making, in the order it
happened. Static HTML, no build step, no backend. The videos are plain mp4
files in this repo; the site is the catalogue and player.

Live at **https://acesandbabes.com** (Vercel, deploys `main` automatically).

## Files

| Path | What it is |
| --- | --- |
| `videos/videos.js` | **The video list. The only file you edit day to day.** |
| `videos/*.mp4` | The videos, remuxed for fast start over HTTP |
| `videos/posters/*.jpg` | One poster frame per video, shown in the grid before play |
| `scripts/ingest.py` | Adds a video: copies it in, makes the poster, measures it, appends the entry |
| `index.html` | The page: stats, search, filters, library grid, evolution timeline, player |
| `assets/app.js` | Page logic. Reads `videos/videos.js`, no network calls of its own |
| `assets/styles.css` | Stylesheet |

## Adding a video

From the Mac, in this folder:

```
python3 scripts/ingest.py ~/Claude/some-project/out/clip.mp4 \
  --title "What it is" --project "Series name" --notes "One line about it" --tags shorts,nfl
git add videos && git commit -m "Add What it is" && git push
```

That copies the file to `videos/`, writes `videos/posters/<name>.jpg`, measures
duration and aspect, and inserts the entry into `videos/videos.js`. Files over
40 MB are re-encoded at 720p (`--max-mb` changes the limit). Vercel republishes
`main` within about a minute of the push.

From anywhere, without the Mac: upload the video to YouTube (unlisted is fine),
open `videos/videos.js` on GitHub, click the pencil, and add an entry with a
`youtube:` link instead of `file:`. Any YouTube link form works, including Shorts.
`drive:` works the same way for a Google Drive file shared as "anyone with the link".

Entry fields: `title`, `file` or `youtube` or `drive`, `poster`, `duration`,
`date` (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM`), `seq` (orders entries that share a
date, e.g. an episode number), `project`, `tags`, `notes`, `aspect` (`9:16` or
`16:9`). Entries with no playable link are hidden and the page says which ones.

Deep links: `#v=<id>` opens a video (the id is the file name without `.mp4`),
`#p=Money%20Math` applies a project filter, `#t=nfl` a tag filter.

## Hosting

- **Site:** Vercel project connected to this GitHub repo. Pushing to `main`
  deploys; branches get preview URLs. Nothing to configure in the repo.
- **Domain:** registered at GoDaddy, DNS already points at Vercel
  (`A @ 76.76.21.21`, `www` → `acesandbabes.com`). Do not publish the GoDaddy
  website-builder site; it would compete with the domain.
- **GitHub Pages is not used.** If Vercel ever goes away: enable Pages from
  `main`, add a `CNAME` file containing `acesandbabes.com`, and change the
  GoDaddy `A` records to GitHub's four (185.199.108.153 … 111.153).

## Local preview

```
python3 -m http.server 8080
```
Then open http://localhost:8080.

## Ideas not built yet

- Pull the list from a YouTube playlist automatically (needs a YouTube Data
  API key restricted to this domain).
- An "add video" form behind a login, so entries can be added from a phone.
- Sections beyond video: links, notes, other published pages.
