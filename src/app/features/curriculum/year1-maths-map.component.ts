import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

type MathsTerm = 'Autumn' | 'Spring' | 'Summer';

interface MathsWeek {
  week: number;
  term: MathsTerm;
  unit: string;
  days: string[];
}

@Component({
  selector: 'bp-year1-maths-map',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-page-hero map-hero">
      <div class="bp-container">
        <a class="map-back" [routerLink]="l('/subjects/maths')">← Back to Maths</a>
        <span class="bp-chip">Year 1 Maths</span>
        <h1>30-week whole-year teaching map</h1>
        <p>Five carefully sequenced Maths lessons for every teaching week, organised across Autumn, Spring and Summer.</p>
        <div class="map-hero__actions">
          <a class="bp-btn" href="/lessons/year-1-maths/brightpath-year-1-maths-30-week-curriculum-map.pdf" download>
            Download the full PDF
          </a>
          <span>30 weeks · 150 daily lessons</span>
        </div>
      </div>
    </header>

    <main class="bp-section">
      <div class="bp-container">
        <section class="map-intro bp-card" aria-labelledby="map-overview-title">
          <div>
            <span class="bp-label">Whole-year structure</span>
            <h2 id="map-overview-title">A clear pathway through Year 1 Maths</h2>
            <p>Based on the National Curriculum for England, with regular consolidation and assessment weeks so teachers can respond to pupil needs.</p>
          </div>
          <div class="term-path" aria-label="Three-term curriculum pathway">
            <div class="term-node term-node--autumn"><strong>Autumn</strong><span>Weeks 1-10</span></div>
            <span class="term-path__arrow" aria-hidden="true">→</span>
            <div class="term-node term-node--spring"><strong>Spring</strong><span>Weeks 11-20</span></div>
            <span class="term-path__arrow" aria-hidden="true">→</span>
            <div class="term-node term-node--summer"><strong>Summer</strong><span>Weeks 21-30</span></div>
          </div>
        </section>

        @if (loading()) {
          <div class="bp-loading"><span class="bp-spinner"></span> Loading the curriculum map…</div>
        } @else if (plan().length === 0) {
          <div class="bp-empty">
            <h3>The curriculum map could not be loaded</h3>
            <p>Please try refreshing the page, or use the PDF download above.</p>
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
                  <span class="term-panel__meta">Weeks {{ weeksFor(term)[0].week }}-{{ weeksFor(term)[weeksFor(term).length - 1].week }} · 50 lessons</span>
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
                            @if (weekLessonSlugs[week.week]) {
                              <a [routerLink]="l('/lessons/year-1-maths/week-' + week.week + '/' + weekLessonSlugs[week.week][dayNumber])">{{ day }} <b aria-hidden="true">→</b></a>
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
          <p>Use each daily title as a lesson focus. Adapt the pace to formative assessment, revisit prerequisite knowledge when needed, and use Weeks 10, 20 and 30 to respond to pupil evidence.</p>
        </aside>
      </div>
    </main>
  `,
  styleUrl: './year1-maths-map.component.scss',
})
export class Year1MathsMapComponent {
  private http = inject(HttpClient);
  private lang = inject(LanguageService);

  readonly terms: MathsTerm[] = ['Autumn', 'Spring', 'Summer'];
  readonly plan = signal<MathsWeek[]>([]);
  readonly loading = signal(true);
  readonly weekLessonSlugs: Record<number, string[]> = {
    1: ['sort-objects-into-groups', 'count-objects-one-to-one', 'represent-numbers-0-to-5', 'match-numerals-to-quantities-0-to-5', 'compare-sets-more-fewer-equal'],
    2: ['count-and-represent-6-to-10', 'read-and-write-numerals-6-to-10', 'place-numbers-on-a-0-to-10-track', 'find-one-more-within-10', 'find-one-less-within-10'],
  };

  constructor() {
    this.http.get<MathsWeek[]>('/lessons/year-1-maths/year1-maths-plan.json').subscribe({
      next: weeks => {
        this.plan.set(weeks);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  weeksFor(term: MathsTerm): MathsWeek[] {
    return this.plan().filter(week => week.term === term);
  }

  l(path: string): string {
    return this.lang.localise(path);
  }
}
