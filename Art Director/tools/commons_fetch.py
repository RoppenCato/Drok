"""Fetches chosen Wikimedia Commons pictures into a folder at up to 960 px wide, with the licence checked first, and
writes _fetched.json beside them (title, artist, date, licence, source page, the url fetched, the size). The studio's
rule: only public domain or CC0 files are fetched; anything else is refused and listed.
  python -I tools/commons_fetch.py <out dir> <list file> [width]
The list file has one line a picture:  File:<Commons title> | <local name without extension>
Copied from the Survival game's studio (C:\\dev\\SG\\Art Director\\tools\\commons_fetch.py, Colin, AD, 2026) by
Leonard, AD on 2026-11-20; changed: a plain client name with nobody's name in it, 960 px by default, UTF-8 output, a file already in the
folder is kept, and one that Commons will not hand over is listed as refused instead of stopping the run."""
import sys, os, re, json, time, urllib.request, urllib.parse, urllib.error
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'reference-board-fetcher/1.0 (public-domain art references, licence checked per file)'}
OK = ('Public domain', 'CC0', 'PDM', 'Public Domain Mark')
def get(url):
    for wait in (0, 20, 60):
        time.sleep(wait)
        try:
            req = urllib.request.Request(url, headers=UA); return urllib.request.urlopen(req, timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
    raise IOError('Commons keeps answering 429')
def strip(html): return re.sub(r'<[^>]+>', '', html or '').strip()
out, lst = sys.argv[1], sys.argv[2]; width = sys.argv[3] if len(sys.argv) > 3 else '960'; os.makedirs(out, exist_ok=True)
wanted = []
for line in open(lst, encoding='utf-8'):
    if '|' not in line: continue
    title, name = [s.strip() for s in line.split('|', 1)]; wanted.append((title, name))
fetched = []; refused = []
for i in range(0, len(wanted), 20):
    batch = wanted[i:i + 20]
    q = urllib.parse.urlencode({'action': 'query', 'titles': '|'.join(t for t, _ in batch), 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata', 'iiurlwidth': width, 'format': 'json'})
    r = json.loads(get('https://commons.wikimedia.org/w/api.php?' + q))
    norm = {}
    for n in r['query'].get('normalized', []): norm[n['to']] = n['from']
    pages = {p['title']: p for p in r['query']['pages'].values()}
    for title, name in batch:
        key = title.replace('_', ' ')
        p = pages.get(key) or pages.get(norm.get(key, key))
        if not p or 'imageinfo' not in p: refused.append((title, 'not found')); continue
        ii = p['imageinfo'][0]; em = ii.get('extmetadata', {}); v = lambda k: strip(em.get(k, {}).get('value', ''))
        lic = v('LicenseShortName')
        if not any(lic.startswith(o) for o in OK): refused.append((title, lic or 'no licence given')); continue
        url = ii.get('thumburl') or ii['url']; ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower().replace('.jpeg', '.jpg')
        if ext not in ('.jpg', '.png'): refused.append((title, 'not a jpg or png: ' + ext)); continue
        fn = name + ext; dest = os.path.join(out, fn)
        if os.path.exists(dest): data = open(dest, 'rb').read()   # kept from an earlier run: only its record is written again
        else:
            time.sleep(4)
            try: data = get(url)
            except IOError as e: refused.append((title, 'not fetched: %s' % e)); continue
            open(dest, 'wb').write(data)
        fetched.append({'file': fn, 'title': p['title'], 'artist': v('Artist')[:120], 'date': (v('DateTimeOriginal') or v('DateTime'))[:40], 'licence': lic, 'page': ii.get('descriptionurl'), 'fetched': url, 'original_px': [ii.get('width'), ii.get('height')], 'bytes': len(data)})
        print('fetched %-34s %-14s %s  %d KB' % (fn, lic, p['title'][:70], len(data) // 1024))
json.dump(fetched, open(os.path.join(out, '_fetched.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
for t, why in refused: print('REFUSED', t, ':', why)
print(len(fetched), 'fetched,', len(refused), 'refused')
