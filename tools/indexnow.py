#!/usr/bin/env python3
"""Tell Bing, Yandex and the other IndexNow engines that pages changed.

IndexNow is a ping: the engines fetch the URLs themselves. It proves the
site is ours by fetching the key file at the root, so that file must be
online before the first ping.

    python3 tools/indexnow.py              # every URL of the sitemap
    python3 tools/indexnow.py https://provigood.com/en/faq.html ...

Run it after each upload. Engines ignore repeats of unchanged pages, so a
full sitemap ping is safe.
"""
import glob, json, os, re, sys, urllib.request

ENDPOINT = 'https://api.indexnow.org/indexnow'
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

keys = [os.path.basename(f)[:-4] for f in glob.glob('*.txt') if re.fullmatch(r'[0-9a-f]{32}\.txt', os.path.basename(f))]
if not keys:
    sys.exit('no IndexNow key file at the repository root')
key = keys[0]

urls = sys.argv[1:]
if not urls:
    urls = re.findall(r'<loc>([^<]+)</loc>', open('sitemap.xml', encoding='utf-8').read())
    base = os.environ.get('BASE', 'https://provigood.com')
    urls = [re.sub(r'^https?://[^/]+', base, u) for u in urls]

host = re.match(r'https?://([^/]+)', urls[0]).group(1)
payload = {'host': host, 'key': key, 'keyLocation': f'https://{host}/{key}.txt', 'urlList': urls}

req = urllib.request.Request(ENDPOINT, data=json.dumps(payload).encode(),
                             headers={'Content-Type': 'application/json; charset=utf-8'})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print(f'{r.status} {r.reason} — {len(urls)} URLs submitted for {host}')
except urllib.error.HTTPError as e:
    print(f'{e.code} {e.reason}')
    print('  200/202 = accepted · 403 = key file not reachable · 422 = URL not on that host')
    sys.exit(1)
