#!/usr/bin/env bash
# Build dist/ — exactly what belongs on the web server, nothing else.
#
#   ./tools/build-dist.sh                      # for https://provigood.com
#   ./tools/build-dist.sh https://www.provigood.com
#
# The repo holds things that must never be served: drafts/ (the parked French
# translations), tools/, docs/ and .git. Uploading the repo wholesale would
# publish unfinished pages. This copies only the site, then rewrites the
# absolute URLs for the target domain.
set -euo pipefail
cd "$(dirname "$0")/.."

BASE="${1:-https://provigood.com}"
OUT="dist"

rm -rf "$OUT"
mkdir -p "$OUT"

# the site itself
cp -R en fr vn images fonts "$OUT"/
cp index.html 404.html favicon.svg robots.txt sitemap.xml styles.css script.js .htaccess llms.txt send-form.php "$OUT"/

# IndexNow key file: the engines fetch it to check the ping is ours
cp ./*[0-9a-f].txt "$OUT"/ 2>/dev/null || true

# rewrite absolute URLs inside the copy, leaving the repo untouched
( cd "$OUT" && python3 ../tools/set-domain.py "$BASE" --write >/dev/null )

# minify the stylesheet in the shipped copy only; the source stays readable
python3 tools/minify-css.py "$OUT/styles.css"

# same for the script: comments and indentation go, line breaks stay
python3 tools/minify-js.py "$OUT/script.js" >/dev/null

# images used only by the parked translations in drafts/ are not shipped
python3 tools/prune-images.py "$OUT"

# 404.html is served for missing URLs at any depth (ErrorDocument in
# .htaccess), so its stylesheet and favicon need root-absolute paths.
sed -e 's#href="styles\.css#href="/styles.css#' -e 's#href="favicon\.svg#href="/favicon.svg#' \
  "$OUT/404.html" > "$OUT/404.html.tmp" && mv "$OUT/404.html.tmp" "$OUT/404.html"

# drafts/ is not shipped, so the robots rule guarding it is pointless
sed -i '' '/Disallow: \/drafts\//d' "$OUT/robots.txt" 2>/dev/null || \
  sed -i '/Disallow: \/drafts\//d' "$OUT/robots.txt"

echo "dist/ prêt pour $BASE"
echo "   $(find "$OUT" -type f | wc -l | tr -d ' ') fichiers, $(du -sh "$OUT" | cut -f1)"
echo
echo "Contrôles :"
grep -rq 'laetitiaperson.github.io' "$OUT" && echo "   ✗ il reste des URLs GitHub" || echo "   ✓ aucune URL GitHub"
[ -d "$OUT/drafts" ] && echo "   ✗ drafts/ présent" || echo "   ✓ drafts/ absent"
[ -d "$OUT/tools" ]  && echo "   ✗ tools/ présent"  || echo "   ✓ tools/ absent"
[ -f "$OUT/.htaccess" ] && echo "   ✓ .htaccess présent (cache navigateur)" || echo "   ✗ .htaccess absent"
[ -f "$OUT/llms.txt" ] && echo "   ✓ llms.txt présent" || echo "   ✗ llms.txt absent"
