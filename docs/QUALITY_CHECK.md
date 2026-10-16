# Quality and verification report

## Completed executable checks

- Offline static site assembled with real model / catalogue embedded, and coherent HTML IDs.
- The fitted model was regenerated from `data/verified_fragdb_sample.json` with scikit-learn.
- Eight Node.js tests passed: five recommendation/data checks and three dependency-free UI bundle smoke checks.
- `node --check` passed for unbundled and bundled JavaScript.
- Python `tests/check_bundle.py` passes (internal navigation IDs and JSON integrity).

## Hosting

- GitHub Pages can serve `index.html` from the root of branch `main` without dependencies.
- The same `index.html` can be opened directly as an interactive offline demo.
- Actual public GitHub deployment has **not** been performed; owner-controlled repository access is required.

## Unverified environment limitation

The execution environment blocks Chromium page navigation even to `file://` and `127.0.0.1` with `ERR_BLOCKED_BY_ADMINISTRATOR`. Therefore browser rendering, visual screenshots, and cross-device end-to-end runs are **not verified** here. The owner should test on desktop/phone after upload. No false browser QA claim is made.

## Research limitations

Dataset count: 10. Note features: 81. Limited masked-note proxy coverage@3: 4/11; seeded random candidate coverage@3: 6/11. This is *not* preference accuracy, and this tiny result did not beat the baseline.
