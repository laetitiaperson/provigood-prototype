#!/usr/bin/env python3
"""Minify a CSS file in place — deliberately conservative.

Used by build-dist.sh on dist/styles.css only. The source styles.css stays
readable: the site has no build step and is edited by hand.

Strings and comments are tokenised first so their content is never touched.
Outside them, only changes that cannot alter meaning are made: comments
removed, whitespace runs collapsed, spaces dropped around { } ; , and the
last semicolon before a closing brace. Spaces around ":" are kept on purpose
(".card :hover" and ".card:hover" select different elements), and so are
spaces inside calc() expressions.

    python3 tools/minify-css.py path/to/file.css
"""
import re, sys

def minify(css):
    out, buf, i, n = [], [], 0, len(css)

    def flush():
        seg = re.sub(r'\s+', ' ', ''.join(buf))
        seg = re.sub(r'\s*([{};,])\s*', r'\1', seg)
        out.append(seg)
        buf.clear()

    while i < n:
        c = css[i]
        if c == '/' and css.startswith('/*', i):
            end = css.find('*/', i + 2)
            i = n if end == -1 else end + 2
            buf.append(' ')
        elif c in '"\'':
            flush()
            j = i + 1
            while j < n and css[j] != c:
                j += 2 if css[j] == '\\' else 1
            out.append(css[i:j + 1])
            i = j + 1
        else:
            buf.append(c)
            i += 1
    flush()
    return re.sub(r';}', '}', ''.join(out)).strip()

if __name__ == '__main__':
    path = sys.argv[1]
    src = open(path, encoding='utf-8').read()
    open(path, 'w', encoding='utf-8').write(minify(src))
