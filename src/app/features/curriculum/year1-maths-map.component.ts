import { lessonFileUrl, downloadFile } from '../../shared/lesson-files';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

type CurriculumSubject = 'maths' | 'english';
type CurriculumTerm = 'Autumn' | 'Spring' | 'Summer';

interface CurriculumWeek {
  week: number;
  term: CurriculumTerm;
  unit: string;
  days: string[];
}

@Component({
  selector: 'bp-year1-maths-map',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-page-hero map-hero" [class.map-hero--english]="subject() === 'english'">
      <div class="bp-container">
        <a class="map-back" [routerLink]="l('/subjects/' + subject())">← Back to {{ subjectName() }}</a>
        <span class="bp-chip">{{ subject() === 'maths' ? '➗' : '📖' }} Year {{ year() }} {{ subjectName() }}</span>
        <h1>30-week whole-year teaching map</h1>
        <p>Five carefully sequenced {{ subjectName() }} lessons for every teaching week, organised across Autumn, Spring and Summer.</p>
        <div class="map-hero__actions">
          @if (subject() === 'maths' && year() === 1) {
            <a class="bp-btn" href="#" (click)="$event.preventDefault(); downloadFile(lessonFileUrl('year-1-maths/brightpath-year-1-maths-30-week-curriculum-map.pdf'))">
              Download the full PDF
            </a>
          }
          <span>30 weeks · 150 daily lessons</span>
        </div>
      </div>
    </header>

    <main class="bp-section">
      <div class="bp-container">
        <section class="map-intro bp-card" aria-labelledby="map-overview-title">
          <div>
            <span class="bp-label">Whole-year structure</span>
            <h2 id="map-overview-title">A clear pathway through Year {{ year() }} {{ subjectName() }}</h2>
            <p>{{ overview() }}</p>
          </div>
          <div class="term-path" aria-label="Three-term curriculum pathway">
            <div class="term-node term-node--autumn"><strong>Autumn</strong><span>Weeks 1–10</span></div>
            <span class="term-path__arrow" aria-hidden="true">→</span>
            <div class="term-node term-node--spring"><strong>Spring</strong><span>Weeks 11–20</span></div>
            <span class="term-path__arrow" aria-hidden="true">→</span>
            <div class="term-node term-node--summer"><strong>Summer</strong><span>Weeks 21–30</span></div>
          </div>
        </section>

        @if (loading()) {
          <div class="bp-loading"><span class="bp-spinner"></span> Loading the curriculum map…</div>
        } @else if (plan().length === 0) {
          <div class="bp-empty">
            <h3>The curriculum map could not be loaded</h3>
            <p>Please return to {{ subjectName() }} and choose the year group again.</p>
          </div>
        } @else {
          <div class="term-list">
            @for (term of terms; track term) {
              <details class="term-panel" [open]="term === 'Autumn'">
                <summary>
                  <span class="term-panel__title">
                    <span class="term-dot" [class]="'term-dot term-dot--' + term.toLowerCase()"></span>
                    {{ term }} term
                  </span>
                  <span class="term-panel__meta">Weeks {{ weeksFor(term)[0].week }}–{{ weeksFor(term)[weeksFor(term).length - 1].week }} · 50 lessons</span>
                  <span class="term-panel__toggle" aria-hidden="true">+</span>
                </summary>

                <div class="week-grid">
                  @for (week of weeksFor(term); track week.week) {
                    <article class="week-card">
                      <div class="week-card__head">
                        <div>
                          <span>Week {{ week.week }}</span>
                          <h3>{{ week.unit }}</h3>
                        </div>
                        <span class="week-card__count">5 days</span>
                      </div>
                      <ol>
                        @for (day of week.days; track day; let dayNumber = $index) {
                          <li>
                            <span>{{ dayNumber + 1 }}</span>
                            @if (hasPublishedLesson(week.week)) {
                              <a [routerLink]="lessonLink(week.week, dayNumber, day)">{{ day }} <b aria-hidden="true">→</b></a>
                            } @else {
                              <p>{{ day }}</p>
                            }
                          </li>
                        }
                      </ol>
                    </article>
                  }
                </div>
                @if (subject() === 'maths' && [1, 2, 3, 4, 6].includes(year())) {
                  <a class="term-evaluation" [routerLink]="evaluationLink(term)">
                    <span aria-hidden="true">✓</span>
                    <div><b>{{ term }} term evaluation</b><small>{{ year() === 6 ? '40-mark assessment' : 'Term assessment with pictures and answers' }}, score bands and editable intervention record</small></div>
                    <strong>Open evaluation pack →</strong>
                  </a>
                }
              </details>
            }
          </div>
        }

        <aside class="planning-note">
          <strong>Planning note</strong>
          <p>{{ planningNote() }}</p>
          <a class="source-link" [href]="curriculumSource()" target="_blank" rel="noopener">View the official National Curriculum for England →</a>
        </aside>
      </div>
    </main>
  `,
  styleUrl: './year1-maths-map.component.scss',
})
export class Year1MathsMapComponent {
  readonly lessonFileUrl = lessonFileUrl;
  readonly downloadFile = downloadFile;
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private lang = inject(LanguageService);

  readonly terms: CurriculumTerm[] = ['Autumn', 'Spring', 'Summer'];
  readonly subject = signal<CurriculumSubject>('maths');
  readonly year = signal(1);
  readonly plan = signal<CurriculumWeek[]>([]);
  readonly loading = signal(true);
  readonly subjectName = computed(() => this.subject() === 'maths' ? 'Maths' : 'English');
  readonly overview = computed(() => this.subject() === 'maths'
    ? 'Sequenced from the National Curriculum for England, balancing fluency, reasoning and problem solving with regular consolidation.'
    : 'Sequenced from the National Curriculum for England, integrating reading, writing, spelling, vocabulary, grammar, punctuation and spoken language.');
  readonly planningNote = computed(() => this.subject() === 'maths'
    ? 'Use each daily title as a lesson focus. Adapt the pace using formative assessment, revisit prerequisite knowledge when needed, and use Weeks 10, 20 and 30 to respond to pupil evidence.'
    : 'Teach reading, writing and spoken language together wherever possible. Select high-quality, age-appropriate texts, adapt the sequence to pupils’ starting points, and use Weeks 10, 20 and 30 for consolidation and assessment.');
  readonly curriculumSource = computed(() => this.subject() === 'maths'
    ? 'https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study'
    : 'https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study');

  readonly weekLessonSlugs: Record<number, string[]> = {
    1: ['sort-objects-into-groups', 'count-objects-one-to-one', 'represent-numbers-0-to-5', 'match-numerals-to-quantities-0-to-5', 'compare-sets-more-fewer-equal'],
    2: ['count-and-represent-6-to-10', 'read-and-write-numerals-6-to-10', 'place-numbers-on-a-0-to-10-track', 'find-one-more-within-10', 'find-one-less-within-10'],
    3: ["compare-quantities-within-10", "compare-numerals-within-10", "use-greater-than-less-than-and-equal-to-language", "order-numbers-from-smallest-to-greatest", "find-missing-numbers-in-sequences"],
    4: ["find-number-bonds-within-5", "find-bonds-systematically", "use-part-whole-models", "find-number-bonds-to-10", "solve-place-value-and-bond-problems"],
    5: ["combine-two-groups", "understand-the-plus-and-equals-signs", "add-by-counting-all", "add-by-counting-on", "represent-addition-stories"],
    6: ["take-away-from-a-group", "understand-the-minus-and-equals-signs", "subtract-by-crossing-out", "subtract-by-counting-back", "represent-subtraction-stories"],
    7: ["build-addition-fact-families", "connect-addition-and-subtraction", "find-a-missing-part", "compare-addition-statements", "compare-subtraction-statements"],
    8: ["choose-addition-or-subtraction", "complete-missing-number-calculations", "solve-one-step-word-problems", "spot-and-explain-calculation-errors", "end-of-unit-assessment"],
    9: ["name-common-3d-shapes", "describe-and-sort-3d-shapes", "name-common-2d-shapes", "describe-and-sort-2d-shapes", "make-repeating-patterns-with-shapes"],
    10: ["review-place-value-within-10", "review-comparing-one-more-and-one-less", "review-addition-within-10", "review-subtraction-within-10", "autumn-problem-solving-check"],
    11: ["count-from-10-to-20", "build-teen-numbers-with-one-ten-and-ones", "represent-numbers-11-to-20", "read-and-write-numerals-11-to-20", "compare-teen-numbers"],
    12: ["order-numbers-to-20", "find-one-more-and-one-less", "use-a-0-to-20-number-line", "complete-missing-number-sequences", "place-value-assessment-and-application"],
    13: ["recall-number-bonds-to-10", "find-number-bonds-to-20-with-objects", "find-doubles-within-20", "use-near-doubles", "add-ones-by-counting-on"],
    14: ["add-by-bridging-through-10", "subtract-without-crossing-10", "subtract-by-bridging-through-10", "build-fact-families-within-20", "complete-missing-number-calculations"],
    15: ["solve-addition-word-problems", "solve-subtraction-word-problems", "choose-the-correct-operation", "explain-and-correct-errors", "end-of-unit-assessment"],
    16: ["count-groups-of-ten", "identify-tens-and-ones", "represent-numbers-21-to-50", "count-forwards-and-backwards-to-50", "place-numbers-on-a-0-to-50-line"],
    17: ["find-one-more-and-one-less-within-50", "compare-numbers-within-50", "order-numbers-within-50", "count-in-twos-and-fives", "place-value-assessment-and-application"],
    18: ["compare-lengths", "measure-length-with-non-standard-units", "measure-and-record-length-in-centimetres", "compare-heights", "solve-length-and-height-problems"],
    19: ["compare-mass", "measure-mass-with-non-standard-units", "explore-full-empty-and-capacity", "compare-volume-and-capacity", "solve-mass-and-capacity-problems"],
    20: ["review-place-value-within-20", "review-addition-and-subtraction-within-20", "review-place-value-within-50", "review-length-height-mass-and-capacity", "spring-problem-solving-check"],
    21: ["count-in-twos", "make-equal-groups", "write-repeated-addition", "build-and-describe-arrays", "find-doubles-by-making-two-equal-groups"],
    22: ["count-in-fives-and-tens", "share-objects-equally", "group-objects-equally", "solve-grouping-and-sharing-problems", "end-of-unit-assessment"],
    23: ["recognise-a-whole-and-a-half", "find-half-of-a-set-of-objects", "find-half-of-a-shape", "find-half-of-a-quantity", "explain-that-two-halves-make-a-whole"],
    24: ["recognise-a-quarter-of-a-shape", "find-a-quarter-of-objects", "find-a-quarter-of-a-quantity", "decide-whether-parts-are-equal", "fractions-assessment-and-application"],
    25: ["use-positional-language", "use-ordinal-numbers", "make-whole-half-and-quarter-turns", "describe-direction-and-position", "follow-and-create-simple-routes"],
    26: ["count-forwards-and-backwards-to-100", "make-groups-of-ten", "represent-two-digit-numbers", "read-and-write-numerals-to-100", "use-a-0-to-100-number-line"],
    27: ["find-one-more-and-one-less-within-100", "compare-two-digit-numbers", "order-two-digit-numbers", "count-in-twos-fives-and-tens", "place-value-assessment-and-application"],
    28: ["recognise-and-name-coins", "recognise-and-name-notes", "compare-coin-values", "make-the-same-amount-in-different-ways", "solve-simple-money-problems"],
    29: ["use-before-after-earlier-and-later", "sequence-days-weeks-and-months", "compare-and-measure-hours-and-minutes", "tell-the-time-to-the-hour", "tell-the-time-to-the-half-hour"],
    30: ["review-place-value-within-100", "review-addition-and-subtraction", "review-multiplication-division-and-fractions", "review-measurement-money-and-time", "final-assessment-and-pupil-reflection"],
  };

  constructor() {
    this.route.paramMap.subscribe(params => {
      const routeSubject = params.get('subject') ?? this.route.snapshot.data['subject'] ?? 'maths';
      const routeYear = Number(params.get('year') ?? this.route.snapshot.data['year'] ?? 1);
      this.subject.set(routeSubject === 'english' ? 'english' : 'maths');
      this.year.set(Number.isInteger(routeYear) && routeYear >= 1 && routeYear <= 6 ? routeYear : 1);
      this.loadPlan();
    });
  }

  weeksFor(term: CurriculumTerm): CurriculumWeek[] {
    return this.plan().filter(week => week.term === term);
  }

  hasPublishedLesson(week: number): boolean {
    const yearOnePublished = this.year() === 1 && Boolean(this.weekLessonSlugs[week]);
    const yearSixPublished = this.year() === 6 && week >= 1 && week <= 30;
    return this.subject() === 'maths' && (yearOnePublished || yearSixPublished || [2, 3].includes(this.year()) && week >= 1 && week <= 30);
  }

  lessonLink(week: number, dayNumber: number, dayTitle: string): string {
    if (this.subject() === 'maths' && this.year() === 6) {
      return this.l(`/lessons/year-6-maths/week/${week}/${this.slugify(dayTitle)}`);
    }
    if ([2, 3].includes(this.year())) return this.l(`/lessons/year-${this.year()}-maths/week-${week}/${this.slugify(dayTitle)}`);
    return this.l(`/lessons/year-1-maths/week-${week}/${this.weekLessonSlugs[week][dayNumber]}`);
  }

  evaluationLink(term: CurriculumTerm): string {
    return this.l(`/lessons/year-${this.year()}-maths/evaluation/${term.toLowerCase()}`);
  }

  l(path: string): string { return this.lang.localise(path); }

  private loadPlan(): void {
    this.loading.set(true);
    this.plan.set([]);
    const url = this.subject() === 'maths' && this.year() === 1
      ? lessonFileUrl('year-1-maths/year1-maths-plan.json')
      : `/curriculum-plans/${this.subject()}/year-${this.year()}.json`;
    this.http.get<CurriculumWeek[]>(url).subscribe({
      next: weeks => {
        this.plan.set(weeks);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
