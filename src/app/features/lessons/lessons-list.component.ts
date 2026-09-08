import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EntityCardComponent } from '../../shared/components/entity-card/entity-card.component';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { LessonSummary } from '../../shared/models/content.models';

@Component({
  selector: 'bp-lessons-list',
  standalone: true,
  imports: [TranslateModule, EntityCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-page-hero">
      <div class="bp-container">
        <span class="bp-chip">{{ 'nav.lessons' | translate }}</span>
        <h1>Lessons</h1>
        <p>Clear, structured lessons from teachers. Learn at your own pace.</p>
      </div>
    </header>

    <section class="bp-section">
      <div class="bp-container">
        <div class="bp-curriculum-feature">
          <div>
            <span class="bp-label">Whole-year planning</span>
            <h2>Year 1 Maths curriculum map</h2>
            <p>See all 30 weeks and 150 daily lesson focuses across Autumn, Spring and Summer.</p>
          </div>
          <bp-entity-card
            [title]="'Year 1 Maths: 30-week teaching map'"
            [subtitle]="'A complete five-days-per-week structure, with a printable PDF for teachers.'"
            [icon]="'🗓️'"
            [eyebrow]="'Curriculum map'"
            [metas]="['30 weeks', '150 lessons', 'Free PDF']"
            [link]="l('/lessons/year-1-maths-map')" />
        </div>

        <h2 class="bp-list-heading">Individual lessons</h2>
        @if (loading()) {
          <div class="bp-loading"><span class="bp-spinner"></span> Loading lessons…</div>
        } @else if (lessons().length === 0) {
          <div class="bp-empty"><h3>No lessons yet</h3><p>Published lessons will show up here.</p></div>
        } @else {
          <div class="bp-grid">
            @for (les of lessons(); track les.id) {
              <bp-entity-card
                [title]="les.title"
                [subtitle]="les.summary"
                [image]="les.coverImageUrl"
                [eyebrow]="les.subjectSlug"
                [metas]="metasFor(les)"
                [link]="l('/lessons/' + les.slug)" />
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class LessonsListComponent {
  private content = inject(ContentService);
  private lang = inject(LanguageService);
  readonly lessons = signal<LessonSummary[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.content.lessons().subscribe({
      next: v => { this.lessons.set(v); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  metasFor(les: LessonSummary): string[] {
    const m: string[] = [];
    if (les.durationMinutes) m.push(`${les.durationMinutes} min`);
    if (les.level) m.push(les.level);
    if (les.teacher?.displayName) m.push(les.teacher.displayName);
    return m;
  }
  l(p: string): string { return this.lang.localise(p); }
}
