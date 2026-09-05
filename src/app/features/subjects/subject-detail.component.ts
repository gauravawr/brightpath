import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityCardComponent } from '../../shared/components/entity-card/entity-card.component';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { Subject, LessonSummary, TestPaperSummary } from '../../shared/models/content.models';

@Component({
  selector: 'bp-subject-detail',
  standalone: true,
  imports: [EntityCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-page-hero">
      <div class="bp-container">
        <span class="bp-chip">{{ subject()?.iconEmoji }} Subject</span>
        <h1>{{ subject()?.name || 'Subject' }}</h1>
        @if (subject()?.description) { <p>{{ subject()!.description }}</p> }
      </div>
    </header>

    <section class="bp-section">
      <div class="bp-container">
        <h2>Lessons</h2>
        @if (lessons().length === 0) {
          <div class="bp-empty"><p>No lessons in this subject yet.</p></div>
        } @else {
          <div class="bp-grid">
            @for (les of lessons(); track les.id) {
              <bp-entity-card [title]="les.title" [subtitle]="les.summary" [image]="les.coverImageUrl"
                [metas]="les.durationMinutes ? [les.durationMinutes + ' min'] : []"
                [link]="l('/lessons/' + les.slug)" />
            }
          </div>
        }

        <h2 style="margin-top:3rem">Practice papers</h2>
        @if (papers().length === 0) {
          <div class="bp-empty"><p>No practice papers in this subject yet.</p></div>
        } @else {
          <div class="bp-grid">
            @for (p of papers(); track p.id) {
              <bp-entity-card [title]="p.title" [subtitle]="p.summary" [icon]="'📝'"
                [metas]="[p.questionCount + ' questions']" [link]="l('/practice/' + p.slug)" />
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class SubjectDetailComponent {
  private route = inject(ActivatedRoute);
  private content = inject(ContentService);
  private lang = inject(LanguageService);
  readonly subject = signal<Subject | null>(null);
  readonly lessons = signal<LessonSummary[]>([]);
  readonly papers = signal<TestPaperSummary[]>([]);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.content.subject(slug).subscribe({ next: s => this.subject.set(s), error: () => {} });
    this.content.lessons(slug).subscribe({ next: v => this.lessons.set(v), error: () => {} });
    this.content.papers(slug).subscribe({ next: v => this.papers.set(v), error: () => {} });
  }
  l(p: string): string { return this.lang.localise(p); }
}
