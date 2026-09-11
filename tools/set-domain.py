#!/usr/bin/env python3
"""Point every absolute URL in the site at a given base.

The site is authored with absolute URLs (canonical, hreflang, og:url,
og:image, JSON-LD @id/url/logo/image, the sitemap and the 404 page's links).
On GitHub Pages it lives under a /provigood-prototype/ path prefix; on the
real domain it sits at the root. Moving between the two means rewriting the
host *and* dropping or adding that prefix, in ~190 places.

Usage
    python3 tools/set-domain.py                       # show what is in use
    python3 tools/set-domain.py https://provigood.com # switch, dry run first
    python3 tools/set-domain.py https://provigood.com --write

Re-running it is harmless: it recognises any known base and normalises to
the one you ask for, so you can switch back and forth.
"""
import io, os, re, sys, glob

KNOWN_BASES = [
    "https://laetitiaperson.github.io/provigood-prototype",
    "https://provigood.com",
    "https://www.provigood.com",
]
# root-relative links carry the prefix too (404.html uses them)
PREFIXED_PATH = "/provigood-prototype/"


def targets():
    files = sorted(set(
        glob.glob("**/*.html", recursive=True)
        + ["sitemap.xml", "robots.txt", "script.js"]
    ))
    return [f for f in files if os.path.exists(f)]


def survey():
    counts = {}
    for f in targets():
        s = io.open(f, encoding="utf-8", errors="ignore").read()
        for b in KNOWN_BASES:
            n = s.count(b)
            if n:
                counts[b] = counts.get(b, 0) + n
    return counts


def switch(new_base, write):
    new_base = new_base.rstrip("/")
    is_root = "github.io" not in new_base          # real domain => no path prefix
    new_prefix = "/" if is_root else PREFIXED_PATH
    changed, total = [], 0

    for f in targets():
        s = io.open(f, encoding="utf-8", errors="ignore").read()
        orig = s
        for b in KNOWN_BASES:
            if b != new_base:
                s = s.replace(b, new_base)
        # root-relative links: /provigood-prototype/en/x -> /en/x (or back)
        if new_prefix != PREFIXED_PATH:
            s = s.replace('="' + PREFIXED_PATH, '="' + new_prefix)
        else:
            s = re.sub(r'="/(?!provigood-prototype/)(en|fr|vn|images|styles|script|favicon)',
                       r'="' + PREFIXED_PATH + r'\1', s)
        # a double slash can appear if a base already ended with one
        s = s.replace(new_base + "//", new_base + "/")
        if s != orig:
            n = sum(1 for a, b in zip(orig.split("\n"), s.split("\n")) if a != b)
            changed.append((f, n)); total += n
            if write:
                io.open(f, "w", encoding="utf-8").write(s)

    return changed, total


def main():
    args = [a for a in sys.argv[1:] if a != "--write"]
    write = "--write" in sys.argv

    if not args:
        print("Bases actuellement présentes :")
        for b, n in sorted(survey().items(), key=lambda x: -x[1]):
            print(f"   {n:5}  {b}")
        print("\nPour basculer :  python3 tools/set-domain.py https://provigood.com --write")
        return

    new_base = args[0]
    if not new_base.startswith("http"):
        sys.exit("La base doit commencer par http(s):// — ex. https://provigood.com")

    changed, total = switch(new_base, write)
    mode = "RÉÉCRIT" if write else "SIMULATION (ajoute --write pour appliquer)"
    print(f"{mode} — base cible : {new_base}\n")
    for f, n in changed:
        print(f"   {n:4} ligne(s)  {f}")
    print(f"\n   {len(changed)} fichiers, {total} lignes")
    if write:
        print("\nPensez ensuite à :")
        print("   - créer le fichier CNAME à la racine avec le domaine (GitHub Pages)")
        print("   - vérifier le sitemap : curl -s <domaine>/sitemap.xml | head")


if __name__ == "__main__":
    main()
