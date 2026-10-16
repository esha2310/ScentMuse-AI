#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
import json
ROOT=Path(__file__).resolve().parents[1]
page=(ROOT/'index.html').read_text(encoding='utf-8')
class Probe(HTMLParser):
    def __init__(self): super().__init__();self.ids=set();self.links=[]
    def handle_starttag(self,tag,attrs):
        at=dict(attrs)
        if 'id' in at:self.ids.add(at['id'])
        if tag=='a' and at.get('href','').startswith('#'):self.links.append(at['href'][1:])
p=Probe();p.feed(page)
required=['home','collection','finder','story','product-grid','product-modal','overlay','drawer','results','embedded-catalogue','embedded-model']
assert all(x in p.ids for x in required), 'Missing site ID'
assert all(link in p.ids for link in p.links), f'Broken in-page link(s): {[x for x in p.links if x not in p.ids]}'
assert '<style>' in page and 'src="app.js"' not in page
assert '<script type="application/json" id="embedded-catalogue">' in page
assert '<script type="application/json" id="embedded-model">' in page
# Check that real shipped JSON artifacts are copied literally to the published HTML.
for name in ['catalogue','model']:
    before=f'<script type="application/json" id="embedded-{name}">'
    val=page.split(before,1)[1].split('</script>',1)[0]
    embedded=json.loads(val)
    disk=json.loads((ROOT/'data'/f'{name}.json').read_text())
    assert embedded==disk, f'Stale {name} embedded in site'
assert 'No invented reviews' not in page or 'not made-up product ratings' in page
print(f'PASS: offline GitHub Pages bundle; {len(p.ids)} unique IDs; {len(p.links)} internal links; catalogue/model consistent')
