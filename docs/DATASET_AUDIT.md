# Phase 2 — Source audit (2026-10-17)

## Packaged catalogue: 10 product entries

**Selected:** FragDB public 10-fragrance sample. Repo https://github.com/FragDB/fragrance-database describes samples and code as MIT licensed, while the full database needs a paid commercial licence. Source names/IDs/brands/years are from the ten records listed in the sample preview. The included top/middle/base note names were manually checked against the source individual fragrance listings, and each row has a clickable verification URL. We export facts rather than republishing review prose, photographs, ratings, price quotes or commercial descriptions.

Upstream repository: https://github.com/FragDB/fragrance-database
Sample overview: https://github.com/FragDB/fragrance-database/blob/main/SAMPLE_PREVIEW.md
Sample licensing: https://github.com/FragDB/fragrance-database/blob/main/LICENSE.md

Numbers verified **in the included local JSON**:
- 10 products; 8 distinct brands; 81 full-note tokens after normalisation.
- Source links are provided for every perfume; all products have at least one note.
- Product data not claimed as a licensed substitute for the paid FragDB full database.

### Explicit restrictions
- The packaging does not contain FragDB's paid full dataset.
- No borrowed photos, ratings, review text or prices. Bottle visuals are *generic original CSS illustrations*, not product photos.
- Metadata and individual factual note names are not user preference labels.
- No checkout or simulated order placement.

## Potential expansion (NOT packaged)

1. [doevent/perfume](https://huggingface.co/datasets/doevent/perfume): dataset card declares MIT, >26K perfumes; example fields `brand`, `name_perfume`, `family`, `ingredients`, `years`. Underlying original data provenance, text/image rights, exact local CSV structure and individual redistribution rights have **not** been independently verified. The optional importer is gated behind user confirmation and excludes photos and texts. Do not present its outputs as approved-by-default.
2. [MrBob23/perfume-description](https://huggingface.co/datasets/MrBob23/perfume-description): card claims CC BY 4.0 and 255 perfumes, note fields; some material reported as collected from a third-party site. Not imported; separate provenance evaluation needed.
3. [parfica/parfica-open-data](https://github.com/parfica/parfica-open-data): CC0 authored note taxonomy and 237 product identities, but no verified real product-to-scent-note rows. OBF barcode/INCI/link fields are ODbL, which were not included.
4. [junyeong-nero/perfume-dataset](https://huggingface.co/datasets/junyeong-nero/perfume-dataset): 42,095 rows with unknown licensing; not used.

## Quality limitations

This is a limited ten-item *starter catalogue*, not a 26K dataset. Product identity and note descriptions are real and traceable. Its 10-item trained TF-IDF index works in browser now. A complete ML generalisation/recommender quality claim needs a much larger curated licensed dataset and independent preference/relevance judgements. Current metrics intentionally avoid such a claim.
