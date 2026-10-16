# ✿ ScentMuse AI — Luxury + Cute Fragrance Discovery

**Status:** Fully packaged static website and browser-based **fitted TF-IDF** note similarity demo. **GitHub Pages publishing is not yet done**; publishing requires the repository owner's action/access.

![ScentMuse AI: original luxury-cute fragrance discovery website](assets/favicon.svg)

## Open the interactive live preview without installing anything

Double-click `index.html` in a modern browser. **All UI CSS, JavaScript, genuine catalogue facts and fitted model data are embedded in this file**, so it works offline (system fonts are used when Google Fonts is unavailable). This `index.html` is also the GitHub Pages website entry point. It is a functioning local interactive demo, not a publicly hosted URL.

## Working features

- Luxury-cream, blush-pink and rose-gold responsive visual system, original SVG fragrance bottle illustrations and cute floral accents.
- Home, scent families, genuine perfume catalogue and story section.
- Search perfumes, brands and fragrance notes; filter by family; sort by name, brand or year.
- Detailed real top/heart/base notes, source attribution, similar perfumes.
- Wishlist and scent tray persisted in `localStorage`; **no checkout, prices, orders or accounts**.
- AI Finder: select scent notes and an optional family, then get live ranked results with transparent TF-IDF cosine similarity, not hard-coded perfume suggestions.
- Mobile menu, keyboard-accessible semantic controls, `prefers-reduced-motion` support.

## Dataset and research honesty

**Included scope: 10 real fragrance profiles, 8 brands and 81 distinct note features**. These records originate from the public **FragDB ten-fragrance sample**, with factual note pyramids independently checked against the source listing URLs in the data. The FragDB README states sample data/code are MIT-licensed, while the full database is sold separately. We omit scraped photography, ratings, review prose, product prices and proprietary commercial description text. Brand trademarks remain with their respective owners. See [data audit](docs/DATASET_AUDIT.md) and source [FragDB](https://github.com/FragDB/fragrance-database).

A Python scikit-learn pipeline fits a TF-IDF vectorizer on full note-name tokens (e.g. `orange_blossom`) and exports IDF / normalised sparse vectors. Browser inference implements the matching query vector and cosine ranking. Because there are **no independently collected user preference labels**, this is **content-based retrieval**, not a supervised preference predictor.

The small held-out *masked-note reconstruction diagnostic* yielded **4/11 = 0.3636** coverage@3, while a single seeded random-reference comparison gave **6/11 = 0.5455**. The model did **not beat this baseline**. This is **not** recommendation accuracy, quality of fit, satisfaction probability or evidence of superiority. Actual metrics are in [docs/ACTUAL_METRICS.json](docs/ACTUAL_METRICS.json).

## Deploy — simplest path (GitHub Pages, no npm)

1. Create a new **public** GitHub repository named `ScentMuse-AI` under your account (e.g. `esha2310`).
2. Extract the ZIP locally and upload **all files and folders inside** (especially `index.html`) to the **root** of the `main` branch. You may upload them using GitHub's **Add file → Upload files**.
3. In the repository go to **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save**.
4. Wait for Pages to complete. Expected URL for `esha2310` is `https://esha2310.github.io/ScentMuse-AI/` (not verified live). The site path works without Vite or React because the final HTML is self-contained.
5. If you named the repo differently, its expected GitHub Pages URL will use the chosen repo name.

**Do not upload the ZIP as a single file.** Upload the extracted contents. No API keys are needed.

## Rebuild after updates (optional)

The editable sources are `src/index.template.html`, `style.css`, `app.js`, `ml/recommender.js`, and `data/*.json`. The published `index.html` is bundled for truly easy GitHub Pages hosting.

```bash
# Rebuild the real model (optional, requires numpy/scikit-learn)
python -m pip install -r ml-research/requirements.txt
python ml-research/train.py

# Regenerate the standalone index.html from editable site code & fitted model
python tools/build_site.py

# Run checks: Node.js 20+ and Python 3.10+; no npm install
node --test tests/*.test.mjs
python tests/check_bundle.py
```

For local development, running `python -m http.server 8000` will serve the site at `http://localhost:8000/`, but you can also just open `index.html` directly.

## Project structure

```text
ScentMuse-AI/
├── index.html                 # final self-contained GitHub Pages website / offline interactive demo
├── assets/favicon.svg        # original icon
├── src/index.template.html    # editable unbundled layout
├── style.css                  # editable source stylesheet
├── app.js                     # editable source UI + data interactions
├── ml/recommender.js          # browser implementation of fitted TF-IDF cosine retrieval
├── data/
│   ├── verified_fragdb_sample.json
│   ├── catalogue.json
│   └── model.json
├── ml-research/train.py       # reproducible model + limited diagnostic
├── docs/
│   ├── ACTUAL_METRICS.json
│   ├── DATASET_AUDIT.md
│   └── QUALITY_CHECK.md
├── tests/
├── tools/build_site.py
└── .github/workflows/check.yml
```

## Known limitations

- Small 10-perfume showcase: family filter may leave only a few choices.
- Only exact full note-name tokens match (e.g. `White Rose` and `Rose` are different features); don't claim semantic perfume embedding accuracy.
- No independent human preference/relevance data, so no validated personal preference accuracy.
- Bottle art is generic original concept illustrations, **not branded product images**.
- Price, checkout, payment, login and fake testimonials intentionally omitted.
- Live GitHub Pages URL will exist **only after you publish** using the steps above.

## Attribution

Original ScentMuse application code is MIT (see `LICENSE`). FragDB free sample terms are described in their public repository; individual factual note pages are linked in each product. Third-party fonts, brand names and tools retain their owners' rights. No photography was copied.
