"""Train and export a reproducible real catalogue-based TF-IDF retrieval index.

Not a supervised user-preference prediction system. Evaluation tests a limited
cross-product note-overlap proxy; never market it as recommendation accuracy.
"""
import argparse
import hashlib
import json
import math
import re
from collections import Counter
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

ROOT = Path(__file__).resolve().parents[1]
TOKEN = re.compile(r"[a-z0-9]+")


def norm_note(note):
    return " ".join(TOKEN.findall(str(note).lower()))


def terms(p):
    # Entire scent names are indivisible tokens: 'orange blossom' != 'orange'.
    return [norm_note(n).replace(' ', '_') for key in ('top', 'middle', 'base') for n in p.get(key, []) if norm_note(n)]


def validate(rows):
    assert len(rows) >= 5, 'Need >=5 sourced products with notes.'
    ids = set()
    for p in rows:
        assert isinstance(p.get('name'), str) and p['name'].strip()
        assert isinstance(p.get('brand'), str) and p['brand'].strip()
        assert p['id'] not in ids, 'Duplicate fragrance ID'
        ids.add(p['id'])
        assert len(terms(p)) >= 1, f'Missing note features: {p["id"]}'
        assert p.get('source', '').startswith('https://'), 'Missing product attribution URL'


def fit(rows):
    docs = [' '.join(terms(p)) for p in rows]
    vect = TfidfVectorizer(token_pattern=r'(?u)\b[a-z0-9_]+\b', lowercase=False,
                           norm='l2', smooth_idf=True, sublinear_tf=True)
    matrix = vect.fit_transform(docs)
    return vect, matrix


def diagnostic(rows):
    """Test proxy: can neighbors reconstruct withheld notes of an unseen perfume?
    Train corpus excludes each test perfume. This is *not* human relevance evaluation.
    """
    if len(rows) < 7:
        return {'status': 'not_run', 'reason': 'Too few catalogue rows'}
    cut = max(2, math.ceil(len(rows) * .3))
    # Deterministic identity-level split; no product occurs in both partitions.
    ranked = sorted(rows, key=lambda p: hashlib.sha256(p['id'].encode()).hexdigest())
    test, train = ranked[:cut], ranked[cut:]
    if len(train) < 4:
        return {'status': 'not_run', 'reason': 'Too few training rows'}
    v, mat = fit(train)
    hits = 0
    baseline_hits = 0
    total = 0
    scores = []
    rng = np.random.default_rng(20261017)
    for t in test:
        available = list(dict.fromkeys(terms(t)))
        # deterministic alternation; held-out exact note string not in query
        observed = available[::2]
        hidden = set(available[1::2])
        if not hidden or not observed:
            continue
        q = v.transform([' '.join(observed)])
        similarity = cosine_similarity(q, mat).ravel()
        top = np.argsort(-similarity, kind='stable')[:min(3, len(train))]
        candidate_notes = set().union(*(set(terms(train[int(i)])) for i in top))
        baseline = rng.choice(len(train), size=len(top), replace=False)
        baseline_notes = set().union(*(set(terms(train[int(i)])) for i in baseline))
        baseline_hits += len(hidden & baseline_notes)
        hits += len(hidden & candidate_notes)
        total += len(hidden)
        scores.append(float(max(similarity)))
    return {'status': 'computed', 'train_count': len(train), 'test_count': len(test),
            'evaluable_test_count': len(scores), 'heldout_note_hits': hits,
            'heldout_note_total': total,
            'hidden_note_coverage_at_3': round(hits / total, 4) if total else None,
            'random_reference_coverage_at_3': round(baseline_hits / total, 4) if total else None,
            'random_reference_hits':baseline_hits,
            'meaning': 'Limited cross-fragrance masked-note reconstruction proxy; NOT preference/recommendation accuracy.'}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--input', default=str(ROOT/'data/verified_fragdb_sample.json'))
    args = ap.parse_args()
    path = Path(args.input)
    rows = json.loads(path.read_text(encoding='utf-8'))
    validate(rows)
    v, mat = fit(rows)
    voc = v.vocabulary_
    vectors = []
    for i in range(mat.shape[0]):
        r = mat.getrow(i)
        vectors.append({'id': rows[i]['id'], 'idx': [int(n) for n in r.indices],
                        'val': [round(float(n), 8) for n in r.data]})
    audit = {'dataset_sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
             'products':len(rows),'unique_brands':len({p['brand'] for p in rows}),
             'unique_notes':len(voc), 'source':'FragDB sample (MIT) with manually checked note-pyramid factual metadata' if len(rows)==10 else str(path),
             'method':'fitted TF-IDF content-based cosine retrieval',
             'evaluation': diagnostic(rows),
             'caveats':['No real user preference labels', 'No product ratings/prices/images',
                        'Training and retrieval share the catalogue index',
                        'A similarity score is not probability of liking a scent']}
    export = {'vocabulary': voc, 'idf': [round(float(x),8) for x in v.idf_],
              'vectors':vectors,'model':'sklearn.TfidfVectorizer',
              'input':'normalized full scent-note tokens separated by spaces',
              'sublinearTf':True}
    output = ROOT/'data'
    output.mkdir(exist_ok=True,parents=True)
    (output/'catalogue.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2), encoding='utf-8')
    (output/'model.json').write_text(json.dumps(export,separators=(',',':')), encoding='utf-8')
    docs = ROOT/'docs'
    docs.mkdir(exist_ok=True)
    (docs/'ACTUAL_METRICS.json').write_text(json.dumps(audit, indent=2), encoding='utf-8')
    print(json.dumps(audit,indent=2))

if __name__=='__main__': main()
