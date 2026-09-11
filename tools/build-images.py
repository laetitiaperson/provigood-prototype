#!/usr/bin/env python3
"""Generate AVIF and WebP variants of the photos the site uses.

Only JPEGs referenced by a published page are processed. Each gets AVIF and
WebP files at a few widths, so <picture> can serve the lightest format the
browser supports at the size the screen needs. The original JPEG stays as
the fallback; it is never modified.

    python3 tools/build-images.py

Re-running is cheap: a variant newer than its source is skipped. Add a new
photo to a page, run this, then reference the variants in the markup.
"""
import glob, io, os, re, time
from PIL import Image

WIDTHS = (480, 960, 1600)
QUALITY = {'avif': 62, 'webp': 82}
# Images carrying small text: lossy artefacts show on letter edges first
TEXT_IMAGES = {'key-achievements.jpg', 'olivo-cold-chain.jpg'}
# Small accreditation logos stay plain <img>: 7 KB saved each is not worth
# another wrapper inside their link and flex container.
EXCLUDE = {'bretagne-commerce-international.jpg', 'stratexio.jpg', 'thu-duc-business-association.jpg'}
QUALITY_TEXT = {'avif': 78, 'webp': 90}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

def used_jpegs():
    pages = glob.glob('en/*.html') + ['index.html', '404.html', 'fr/index.html', 'vn/index.html']
    found = set()
    for p in pages:
        if not os.path.exists(p): continue
        s = io.open(p, encoding='utf-8').read()
        for src in re.findall(r'\b(?:src|srcset)="([^"]+)"', s):
            for part in src.split(','):
                u = part.strip().split(' ')[0].split('?')[0]
                if re.search(r'\.jpe?g$', u, re.I) and not u.startswith(('http', 'data:')):
                    f = os.path.normpath(os.path.join(os.path.dirname(p), u))
                    if os.path.exists(f) and os.path.basename(f) not in EXCLUDE: found.add(f)
    return sorted(found)

def main():
    t0 = time.time()
    made = skipped = 0
    before = after = 0
    for src in used_jpegs():
        name = os.path.basename(src)
        stem = os.path.splitext(src)[0]
        q = QUALITY_TEXT if name in TEXT_IMAGES else QUALITY
        img = Image.open(src).convert('RGB')
        w0, h0 = img.size
        widths = sorted({w for w in WIDTHS if w < w0} | {min(w0, WIDTHS[-1])})
        before += os.path.getsize(src)
        largest = 0
        for w in widths:
            h = round(h0 * w / w0)
            frame = img if w == w0 else img.resize((w, h), Image.LANCZOS)
            for fmt in ('avif', 'webp'):
                out = f'{stem}-{w}.{fmt}'
                if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
                    skipped += 1
                else:
                    if fmt == 'avif':
                        frame.save(out, 'AVIF', quality=q['avif'], speed=6)
                    else:
                        frame.save(out, 'WEBP', quality=q['webp'], method=6)
                    made += 1
                if fmt == 'avif' and w == widths[-1]:
                    largest = os.path.getsize(out)
        after += largest
        print(f'  {name:42} {w0:>4}px  {os.path.getsize(src)//1024:4} Ko JPEG -> {largest//1024:4} Ko AVIF  ({", ".join(map(str, widths))})')
    print(f'\n  {made} fichiers créés, {skipped} déjà à jour, {round(time.time()-t0)} s')
    print(f'  pleine largeur : {round(before/1024/1024,2)} Mo en JPEG -> {round(after/1024/1024,2)} Mo en AVIF '
          f'({round(100 - 100*after/before)} % de moins)')

if __name__ == '__main__':
    main()
