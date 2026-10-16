#!/usr/bin/env python3
"""Create offline-openable, GitHub Pages-ready index.html with original UI and real fitted ML artifacts."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'src/index.template.html').read_text(encoding='utf-8')
css=(ROOT/'style.css').read_text(encoding='utf-8')
js=(ROOT/'app.js').read_text(encoding='utf-8')
ml=(ROOT/'ml/recommender.js').read_text(encoding='utf-8').replace('export function ', 'function ')
assert js.startswith('import {recommend, similarTo, allNotes, normalizeNote} from \'./ml/recommender.js\';')
js=js.split('\n',1)[1]
# Avoid needing a local HTTP server by embedding actual fitted model and original catalogue.
cat=json.loads((ROOT/'data/catalogue.json').read_text(encoding='utf-8'))
model=json.loads((ROOT/'data/model.json').read_text(encoding='utf-8'))
assert {p['id'] for p in cat} == {v['id'] for v in model['vectors']}
cat_json=json.dumps(cat,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
model_json=json.dumps(model,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
assert '<link rel="stylesheet" href="style.css">' in html
assert '<script type="module" src="app.js"></script>' in html
html=html.replace('<link rel="stylesheet" href="style.css">','<style>\n'+css+'\n</style>')
html=html.replace('<script type="module" src="app.js"></script>',
                  f'<script type="application/json" id="embedded-catalogue">{cat_json}</script>\n'
                  f'<script type="application/json" id="embedded-model">{model_json}</script>\n'
                  '<script>\n'+ml+'\n'+js+'\n</script>')
assert 'id="embedded-catalogue"' in html
assert 'id="embedded-model"' in html
assert 'src="app.js"' not in html
(ROOT/'index.html').write_text(html,encoding='utf-8')
print(f'Created {ROOT/"index.html"} ({len(html.encode("utf-8")):,} bytes) with {len(cat)} real perfumes, {len(model["vocabulary"])} note features')
