# Primary maths release checks

Years 1, 2 and 3 have 150 lesson packs each. The latest release adds teacher-controlled pauses across their PowerPoints and five illustrated questions on one A4 pupil worksheet page, with a separate answer page. End-of-term assessments for Years 1–4 retain two pupil pages and separate mark schemes.

The Year 1 A4 worksheet builder preserves the existing lesson questions and answers and reuses their mathematical pictures. It verifies two A4 pages, page boundaries and answer consistency and renders all 900 pages. Inspect representative models after any layout change.

Use the bundled Python/Node runtimes:

```
python scripts/build_year1_a4_worksheets.py
python scripts/check_year1_a4_layout.py
python scripts/prepare_primary_click_pacing.py
node scripts/finalize_primary_click_pacing.mjs
./scripts/verify_year3_animations.ps1 -Root .qa/primary-click-pacing
node scripts/publish_primary_review.mjs
```

The pacing preparation preserves all non-timing slide content from the current published local PowerPoints, including answer-slide repairs. It retains originals in `.qa/primary-click-pacing`. PowerPoint verifies both native effect counts and the trigger of every effect. The publisher requires matching hashes, clean package/layout receipts, native trigger checks and complete worksheet validation. See `YEAR3_MATHS.md` for the Year 3 build pipeline.

After the production Angular build, upload the validated resource manifests using `blob-lessons.mjs --dry-run --release scripts/releases/primary-review.json` and then `blob-lessons.mjs --release scripts/releases/primary-review.json`. The uploader checks hashes and uses conditional writes; it never deletes blobs. Deploy the existing Azure Static Web App and run `verify_primary_release.mjs` to verify every published resource against the release hashes.
