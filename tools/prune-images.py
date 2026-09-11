#!/usr/bin/env python3
"""Delete from a built site the images that no shipped file refers to.

The repo's images/ also holds photos used only by the parked translations
in drafts/, which dist/ does not ship. Every text file of the built site is
scanned for "images/<file>" references (src, srcset, CSS url(), og:image,
JSON-LD logos...), and any file in images/ that none of them names is
removed from the copy. The repo itself is never touched.

    python3 tools/prune-images.py dist
"""
import pathlib, re, sys, urllib.parse

TEXT = {'.html', '.css', '.js', '.txt', '.xml', '.php', '.json', '.webmanifest'}

root = pathlib.Path(sys.argv[1])
images = root / 'images'

referenced = set()
for f in root.rglob('*'):
    if f.is_file() and f.suffix.lower() in TEXT and images not in f.parents:
        text = f.read_text(encoding='utf-8', errors='ignore')
        for ref in re.findall(r'images/([^"\'\s,)?#<>]+)', text):
            referenced.add(urllib.parse.unquote(ref))

removed, size = 0, 0
for f in sorted(p for p in images.rglob('*') if p.is_file()):
    if f.relative_to(images).as_posix() not in referenced:
        size += f.stat().st_size
        f.unlink()
        removed += 1
for d in sorted((p for p in images.rglob('*') if p.is_dir()), reverse=True):
    if not any(d.iterdir()):
        d.rmdir()

missing = sorted(r for r in referenced if not (images / r).is_file())
print('images: %d unused files removed (%.1f MB)' % (removed, size / 1e6))
if missing:
    print('images: WARNING, referenced but missing: ' + ', '.join(missing))
    sys.exit(1)
