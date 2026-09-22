# Year 3 maths

150 lessons across the existing 30-week, three-term BrightPath map. Each lesson contains an editable teacher plan, pre-teach tasks, 14 native animated teaching slides, and lower/expected/higher worksheets. Each worksheet has five questions on one A4 pupil page, with a separate illustrated answer page. Tess continues as the familiar discussion character; slides use the simpler Year 3 board layout.

## Curriculum basis

England Year 3 National Curriculum, checked 18 September 2026:
https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study#year-3-programme-of-study

Coverage: place value, numerals and words to 1000, counting and 10/100 more or less (weeks 1–2); mental and column calculation, estimation and inverse (3–6); 3/4/8 tables, two-digit by one-digit multiplication and division (7–9); money, length/perimeter, mass/capacity (11–13); unit and non-unit fractions, tenths, equivalence, same-denominator operations and comparisons (14–19); clocks, Roman numerals, minute accuracy, durations and calendars (21, 26); shapes, right angles, turns, parallel/perpendicular lines (22–24); scaled charts, pictograms and tables (25, 29); scaling/correspondence and practical reasoning (27–28). Weeks 10, 20 and 30 consolidate. Term assessments are short diagnostic checks, not standardised attainment tests.

## Build and review

Use the bundled Node/Python runtimes from the BrightPath root:

```
node scripts/year3_maths_content.mjs
python scripts/build_year3_maths_resources.py
python scripts/check_year3_maths_resources.py
./scripts/render_year3_teacher_plans.ps1
python scripts/check_year3_teacher_plans.py
node scripts/build_year3_maths_slides.mjs
python scripts/prepare_year3_animations.py
./scripts/render_year3_slides.ps1
./scripts/verify_year3_animations.ps1
python scripts/check_year3_maths_content.py
node scripts/finalize_year3_maths.mjs
python scripts/check_year3_animation_layout.py
python scripts/check_year3_click_pacing.py
node scripts/publish_year3_maths.mjs
node scripts/check_year3_published.mjs
python scripts/build_year3_assessments.py
```

Export the assessment Word records using installed Word, then run `check_primary_term_assessments.py` and `publish_primary_term_assessments.py`. Slide preparation writes native entrance, exit, motion and rotation timing. PowerPoint renders separate final-state preview decks and checks actual text fit; finalisation validates the animated downloadable PPTX. Inspect rendered models and verify lesson/answer consistency before publishing. Website previews show the completed slide; click-by-click animation is in the downloaded PowerPoint Slide Show.

Resources are staged in ignored `.qa/year3-maths` and published to ignored `lessons/year-3-maths`. The tracked release manifest records every published resource hash. Run Angular with `--configuration local-lessons --port 4200` and the lesson server on 4300 for local review. Azure publication is a separate release step.

Static geometry diagnostics retain overlaps used by replacement text and moving numbers. The animation-layout check verifies every reported overlap at each teacher-click boundary, retaining the original diagnostics and a hash-bound review. Native PowerPoint separately verifies all animation-effect counts and renders all final slide states.
