import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EntityCardComponent } from '../../shared/components/entity-card/entity-card.component';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { TestPaperSummary } from '../../shared/models/content.models';

@Component({
  selector: 'bp-practice-list',
  standalone: true,
  imports: [TranslateModule, EntityCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-page-hero">
      <div class="bp-container">
        <span class="bp-chip">{{ 'nav.practice' | translate }}</span>
        <h1>Practice papers</h1>
        <p>Test yourself with timed papers and instant, automatic scoring.</p>
      </div>
    </header>

    <section class="bp-section">
      <div class="bp-container">
        @if (loading()) {
          <div class="bp-loading"><span class="bp-spinner"></span> Loading papers…</div>
        } @else if (papers().length === 0) {
          <div class="bp-empty"><h3>No practice papers yet</h3><p>Published papers will show up here.</p></div>
        } @else {
          <div class="bp-grid">
            @for (p of papers(); track p.id) {
              <bp-entity-card
                [title]="p.title"
                [subtitle]="p.summary"
                [icon]="'📝'"
                [eyebrow]="p.subjectSlug"
                [metas]="metasFor(p)"
                [link]="l('/practice/' + p.slug)" />
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class PracticeListComponent {
  private content = inject(ContentService);
  private lang = inject(LanguageService);
  readonly papers = signal<TestPaperSummary[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.content.papers().subscribe({
      next: v => { this.papers.set(v); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  metasFor(p: TestPaperSummary): string[] {
    const m: string[] = [`${p.questionCount} questions`];
    if (p.durationMinutes) m.push(`${p.durationMinutes} min`);
    if (p.level) m.push(p.level);
    return m;
  }
  l(p: string): string { return this.lang.localise(p); }
}
