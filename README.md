# V Kedar's Command Center

A video archive of everything V Kedar has been making, in the order it
happened. Static HTML, no build step, no backend. The videos live on
YouTube; this site is the catalogue and player.

Live at **acesandbabes.com** once the DNS steps below are done.

## Files

| Path | What it is |
| --- | --- |
| `videos/videos.js` | **The video list. The only file you edit day to day.** |
| `index.html` | The page: stats, search, filters, library grid, evolution timeline, player |
| `assets/app.js` | Page logic. Reads `videos/videos.js`, no network calls of its own |
| `assets/styles.css` | Stylesheet |
| `CNAME` | Tells GitHub Pages the custom domain |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

## Adding a video

1. Upload it to YouTube. Unlisted is fine; the site can still embed it.
2. Open `videos/videos.js` on GitHub and click the pencil icon.
3. Add an entry inside the `videos: [ ... ]` list:

```js
{
  title: "Second pass with voiceover",
  youtube: "https://youtube.com/shorts/XXXXXXXXXXX",
  date: "2026-06-14",
  project: "YouTube Shorts video generation",
  tags: ["shorts", "voice"],
  notes: "Added narration. First one that felt finished.",
},
```

4. Commit. GitHub Pages republishes within about a minute.

Any YouTube link works: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`,
or just the 11-character id. `project`, `tags`, and `notes` are optional but
the filters and the timeline are better with them. Shorts are vertical by
default; add `aspect: "16:9"` to a landscape video. Set `defaultAspect` at
the top of the file if most videos are landscape.

Instead of `youtube` an entry can use `drive: "<Google Drive link>"` for a
file shared as "anyone with the link", or `file: "videos/clip.mp4"` for a
small mp4 committed to the repo (keep those under 100 MB each).

Entries with no playable link are hidden and the page says which ones.

## Deploying: GitHub Pages plus the GoDaddy domain

The domain is registered at GoDaddy. The site is served free by GitHub
Pages. GoDaddy only needs to point the domain at GitHub.

**On GitHub (once):**
1. Merge this branch into `main`.
2. Repo → Settings → Pages → *Build and deployment* → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.
3. On the same page, under *Custom domain*, enter `acesandbabes.com` and Save.
   The `CNAME` file in the repo already matches.
4. After DNS has propagated (minutes to a few hours), tick **Enforce HTTPS**.

**On GoDaddy (once):** Domain → DNS → Manage DNS. Remove any existing `A`
record for `@` and any "Parked" or website-builder forwarding, then add:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | vikramkedar4.github.io |

Do not publish the GoDaddy website-builder site; it would compete with
the domain. The free GoDaddy plan is enough because nothing is hosted
there.

## Local preview

```
python3 -m http.server 8080
```
Then open http://localhost:8080. Double-clicking `index.html` also works,
since the video list is plain JavaScript rather than a fetched file.

## Ideas not built yet

- Pull the list from a YouTube playlist automatically (needs a YouTube Data
  API key restricted to this domain).
- An "add video" form behind a login, so entries can be added from a phone.
- Sections beyond video: links, notes, other published pages.
