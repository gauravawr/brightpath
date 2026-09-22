# Year 2 maths resources

The 150 lessons cover 30 weeks across Autumn, Spring and Summer. Each pack contains:

- An editable teacher plan and its PDF preview.
- A 14-slide PowerPoint with native click-controlled animations, I do / We do / You do, Tess the tortoise, five expected questions and answers.
- Lower, expected and higher illustrated worksheets: five questions on one A4 pupil page, followed by a separate answer page.
- Three pre-teach questions and a separate answer page.

The curriculum and examples live in `year2_maths_content.mjs`. Build outputs go into the ignored `.qa/year2-maths` folder. Published binary resources live under the ignored `lessons/year-2-maths` folder; `releases/year2-maths.json` records their release hashes.

Run from the BrightPath project root using the bundled Node and Python runtimes:

```text
node scripts/year2_maths_content.mjs
python scripts/build_year2_maths_resources.py
powershell -File scripts/render_year2_teacher_plans.ps1
python scripts/check_year2_maths_resources.py
node scripts/build_year2_maths_slides.mjs .qa/year2-maths
powershell -File scripts/animate_maths_visual_rollout.ps1 -BuildRoot .qa/year2-maths/build
node scripts/finalize_year2_maths.mjs
node scripts/publish_year2_maths.mjs
node node_modules/@angular/cli/bin/ng.js build --configuration production
```

PowerPoint and Word native rendering require installed desktop Office. Review representative rendered pages and slides as well as the automated checks. The publisher checks PowerPoint receipts, text fit, expected-question consistency and complete inputs before copying resources.

For local review, run `scripts/serve-local-lessons.mjs` on port 4300 and Angular with `--configuration local-lessons --port 4200`. Open `/en/curriculum/maths/year/2`. Website slide previews show the completed teaching state; downloaded PowerPoints play the click-controlled animations in Slide Show.

The teacher-plan template is the established Year 1 add-by-counting-on plan. Its editable fields, table structure and four-page organisation are retained with Year 2 content and teal accents. Worksheet pupil pages are independently designed for economical A4 printing.
