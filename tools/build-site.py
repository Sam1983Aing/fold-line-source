#!/usr/bin/env python3
"""
Fold Line V7 as a static site for GitHub Pages (21 Oct 2026).

    python3 tools/build-site.py OUT_DIR

OUT_DIR is a checkout of Sam1983Aing/fold-line (public, Pages from main at /), live at
https://sam1983aing.github.io/fold-line/. This writes only what the page loads, read from the page itself:
- the page as index.html
- every script the page asks loadScript for, hero/look.js, and the libraries in its <script src> tags
- fonts/fonts.css and the font files it names, the eight guides' photos (640 px, not the originals)
- vendor/README.md (the libraries' licences), tools/site/README.md and tools/site/preview.jpg, and .nojekyll
The folders it fills (hero, interior, sections, vendor, fonts, images) are emptied first, so a script the page stops
loading leaves the site too. Nothing else in OUT_DIR is touched (.git, a LICENSE if one is added later).
Then commit and push in OUT_DIR, and Pages rebuilds by itself.
"""
import pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
V7 = ROOT / 'Fold Line' / 'V7'
EXTRA = ROOT / 'tools' / 'site'
if len(sys.argv) != 2:
    sys.exit(__doc__)
OUT = pathlib.Path(sys.argv[1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)

html = (V7 / 'FOLD LINE - V7.html').read_text(encoding='utf-8')
files = {'hero/look.js'}
files |= set(re.findall(r"'((?:hero|interior|sections)/[a-z0-9-]+\.js)'", html))       # what loadScript is asked for
# a walk's strip is asked for by a name the page puts together ('interior/' + key + '-strip.js'), so all five go
files |= {'interior/' + p.name for p in (V7 / 'interior').glob('*-strip.js')}
files |= set(re.findall(r'<script src="(vendor/[^"]+\.js)"', html))
files |= {'vendor/README.md', 'fonts/fonts.css'}
files |= {'fonts/' + f for f in re.findall(r'url\(([a-z0-9-]+\.woff2)\)', (V7 / 'fonts' / 'fonts.css').read_text(encoding='utf-8'))}
files |= {'images/guides/' + p.name for p in (V7 / 'images' / 'guides').glob('*.jpg')}

# every other file the page points at must be one of these
for ref in re.findall(r'(?<![-\w])(?:src|href)="((?!https?:|data:|#|mailto:)[^"?]+\.(?:js|css|woff2|jpg|png))"', html):
    if ref not in files:
        sys.exit(f'the page points at {ref}, which is not packed')
missing = [f for f in sorted(files) if not (V7 / f).is_file()]
if missing:
    sys.exit('missing in Fold Line/V7: ' + ', '.join(missing))

for d in ('hero', 'interior', 'sections', 'vendor', 'fonts', 'images'):
    shutil.rmtree(OUT / d, ignore_errors=True)
for f in sorted(files):
    (OUT / f).parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(V7 / f, OUT / f)
(OUT / 'index.html').write_text(html, encoding='utf-8')
shutil.copy2(EXTRA / 'README.md', OUT / 'README.md')
(OUT / 'assets').mkdir(exist_ok=True)
shutil.copy2(EXTRA / 'preview.jpg', OUT / 'assets' / 'preview.jpg')
(OUT / '.nojekyll').write_text('', encoding='utf-8')

size = sum(p.stat().st_size for p in OUT.rglob('*') if p.is_file() and '.git' not in p.parts)
print(f'{OUT}  {len(files) + 4} files, {size/1024/1024:.2f} MB')
