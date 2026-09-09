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
            <a class="bp-btn" href="/lessons/year-1-maths/brightpath-year-1-maths-30-week-curriculum-map.pdf" download>
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
    const yearSixAutumnPublished = this.year() === 6 && week >= 1 && week <= 10;
    return this.subject() === 'maths' && (yearOnePublished || yearSixAutumnPublished);
  }

  lessonLink(week: number, dayNumber: number, dayTitle: string): string {
    if (this.subject() === 'maths' && this.year() === 6) {
      return this.l(`/lessons/year-6-maths/week/${week}/${this.slugify(dayTitle)}`);
    }
    return this.l(`/lessons/year-1-maths/week-${week}/${this.weekLessonSlugs[week][dayNumber]}`);
  }

  l(path: string): string { return this.lang.localise(path); }

  private loadPlan(): void {
    this.loading.set(true);
    this.plan.set([]);
    const url = this.subject() === 'maths' && this.year() === 1
      ? '/lessons/year-1-maths/year1-maths-plan.json'
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
