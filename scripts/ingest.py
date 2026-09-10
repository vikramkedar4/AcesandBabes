#!/usr/bin/env python3
"""Add a video to the Command Center from the Mac.

    python3 scripts/ingest.py path/to/clip.mp4 --title "What it is" --project "Series name" \
        [--notes "…"] [--tags a,b,c] [--date 2026-09-12] [--seq 3] [--slug custom-name] [--max-mb 40]

What it does
  1. remuxes the file into videos/<slug>.mp4 with the moov atom up front (fast start
     over HTTP); if the file is bigger than --max-mb it is re-encoded at 720p instead
  2. writes videos/posters/<slug>.jpg from the first frame that has real content
  3. measures duration and aspect with ffprobe
  4. inserts an entry into videos/videos.js above the ingest marker

Then: git add videos && git commit -m "Add <title>" && git push. Vercel republishes main.
Needs ffmpeg and ffprobe on PATH (brew install ffmpeg) and Pillow (python3 -m pip
install pillow, or the global copy on this Mac).
"""
import argparse, datetime, json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, 'videos', 'videos.js')
MARKER = '    // <<ingest: new entries are inserted above this line>>'


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def probe(path):
    out = run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
               'stream=width,height:format=duration', '-of', 'json', path]).stdout
    j = json.loads(out)
    s = j['streams'][0]
    return int(s['width']), int(s['height']), float(j['format']['duration'])


def slugify(s):
    s = re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
    return s[:60] or 'video'


def poster(mp4, jpg, width, duration):
    from PIL import Image, ImageStat
    scale = 'scale=640:-2' if width > 1080 else 'scale=540:-2'
    tmp = os.path.join(tempfile.gettempdir(), 'cc-poster.png')
    best = None
    for t in (0.5, 1.5, 3, 5, 8, 12, 20):
        if t >= duration - 0.2:
            break
        run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', mp4, '-frames:v', '1', '-vf', scale, tmp])
        im = Image.open(tmp).convert('RGB')
        sd = ImageStat.Stat(im.convert('L')).stddev[0]
        best = im if best is None else best
        if sd > 28 or t >= 8:
            best = im
            break
    if best is None:
        run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-frames:v', '1', '-vf', scale, tmp])
        best = Image.open(tmp).convert('RGB')
    best.save(jpg, 'JPEG', quality=82, optimize=True)


def js_str(s):
    return json.dumps(str(s), ensure_ascii=False)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('source')
    ap.add_argument('--title', required=True)
    ap.add_argument('--project', required=True)
    ap.add_argument('--notes', default='')
    ap.add_argument('--tags', default='', help='comma-separated')
    ap.add_argument('--date', default=None, help='YYYY-MM-DD or YYYY-MM-DDTHH:MM; default: file modification time')
    ap.add_argument('--seq', type=int, default=None)
    ap.add_argument('--slug', default=None)
    ap.add_argument('--max-mb', type=float, default=40, help='re-encode at 720p above this size')
    a = ap.parse_args()

    src = os.path.abspath(a.source)
    if not os.path.isfile(src):
        sys.exit(f'not a file: {src}')
    slug = a.slug or slugify(os.path.splitext(os.path.basename(src))[0])
    dst = os.path.join(ROOT, 'videos', f'{slug}.mp4')
    jpg = os.path.join(ROOT, 'videos', 'posters', f'{slug}.jpg')
    if os.path.exists(dst):
        sys.exit(f'already exists: {os.path.relpath(dst, ROOT)} (pass --slug to pick another name)')
    os.makedirs(os.path.dirname(jpg), exist_ok=True)

    w, h, dur = probe(src)
    size_mb = os.path.getsize(src) / 1048576
    if size_mb > a.max_mb:
        vf = 'scale=720:-2' if w <= h else 'scale=-2:720'
        print(f'{size_mb:.0f} MB > {a.max_mb:.0f} MB, re-encoding at 720p…')
        run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', vf, '-c:v', 'libx264', '-crf', '25', '-preset', 'medium',
             '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '112k', '-movflags', '+faststart', dst])
    else:
        run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-c', 'copy', '-movflags', '+faststart', dst])
    w, h, dur = probe(dst)
    poster(dst, jpg, w, dur)

    date = a.date or datetime.datetime.fromtimestamp(os.path.getmtime(src)).strftime('%Y-%m-%dT%H:%M')
    tags = [t.strip() for t in a.tags.split(',') if t.strip()]
    lines = [
        '    {',
        f'      title: {js_str(a.title)},',
        f'      file: "videos/{slug}.mp4", poster: "videos/posters/{slug}.jpg", duration: {round(dur)},'
        + (' aspect: "16:9",' if w > h else ''),
        f'      date: {js_str(date)},' + (f' seq: {a.seq},' if a.seq is not None else ''),
        f'      project: {js_str(a.project)},',
        f'      tags: [{", ".join(js_str(t) for t in tags)}],',
        f'      notes: {js_str(a.notes)},',
        '    },',
    ]
    entry = '\n'.join(lines) + '\n'

    with open(MANIFEST, encoding='utf-8') as f:
        text = f.read()
    if MARKER not in text:
        sys.exit('marker line not found in videos/videos.js; add the entry by hand:\n' + entry)
    text = text.replace(MARKER, entry + MARKER, 1)
    with open(MANIFEST, 'w', encoding='utf-8') as f:
        f.write(text)

    print(f'added  {os.path.relpath(dst, ROOT)}  ({os.path.getsize(dst)/1048576:.1f} MB, {w}x{h}, {dur:.0f}s)')
    print(f'poster {os.path.relpath(jpg, ROOT)}')
    print(f'entry  "{a.title}" in videos/videos.js\n')
    print('next:  git add videos && git commit -m ' + json.dumps('Add ' + a.title) + ' && git push')


if __name__ == '__main__':
    main()
