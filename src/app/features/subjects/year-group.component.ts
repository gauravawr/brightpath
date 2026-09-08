import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { EntityCardComponent } from '../../shared/components/entity-card/entity-card.component';
import { LessonSummary, TestPaperSummary } from '../../shared/models/content.models';

@Component({
  selector: 'bp-year-group', standalone: true, imports: [RouterLink, EntityCardComponent], changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-page-hero"><div class="bp-container">
      <a class="back" [routerLink]="l('/subjects/' + subjectSlug)">← Back to {{ subjectName }}</a>
      <span class="bp-chip">{{ subjectName }}</span><h1>Year {{ year }}</h1>
      <p>Lessons and practice papers for this year group. New resources will appear here as BrightPath grows.</p>
    </div></header>
    <main class="bp-section"><div class="bp-container">
      <h2>Lessons</h2>
      @if (lessons().length) { <div class="bp-grid">@for (lesson of lessons(); track lesson.id) { <bp-entity-card [title]="lesson.title" [subtitle]="lesson.summary" [image]="lesson.coverImageUrl" [link]="l('/lessons/' + lesson.slug)" /> }</div> }
      @else { <div class="bp-empty compact"><p>This year-group folder is ready. Lessons will be added gradually.</p></div> }
      <h2 class="papers">Practice papers</h2>
      @if (papers().length) { <div class="bp-grid">@for (paper of papers(); track paper.id) { <bp-entity-card [title]="paper.title" [subtitle]="paper.summary" [icon]="'📝'" [metas]="[paper.questionCount + ' questions']" [link]="l('/practice/' + paper.slug)" /> }</div> }
      @else { <div class="bp-empty compact"><p>This practice-paper folder is ready for future resources.</p></div> }
    </div></main>
  `,
  styles: [`.back{display:block;width:max-content;margin-bottom:1rem;font-weight:700}.papers{margin-top:3rem}.compact{padding-block:2rem;background:var(--white);border:1px dashed var(--border);border-radius:var(--r-md)}`],
})
export class YearGroupComponent {
  private route = inject(ActivatedRoute); private content = inject(ContentService); private lang = inject(LanguageService);
  readonly subjectSlug = (this.route.snapshot.paramMap.get('slug') ?? '').toLowerCase(); readonly year = Number(this.route.snapshot.paramMap.get('year') ?? 1);
  readonly subjectName = this.subjectSlug === 'maths' ? 'Maths' : this.subjectSlug === 'english' ? 'English' : this.subjectSlug;
  readonly lessons = signal<LessonSummary[]>([]); readonly papers = signal<TestPaperSummary[]>([]);
  constructor() {
    this.content.lessons(this.subjectSlug).subscribe({ next: items => this.lessons.set(items.filter(item => this.matches(item.slug, item.title))), error: () => {} });
    this.content.papers(this.subjectSlug).subscribe({ next: items => this.papers.set(items.filter(item => this.matches(item.slug, item.title))), error: () => {} });
  }
  private matches(slug: string, title: string): boolean { const text = `${slug} ${title}`.toLowerCase(); return text.includes(`year-${this.year}`) || text.includes(`year ${this.year}`) || text.includes(`y${this.year}-`); }
  l(path: string): string { return this.lang.localise(path); }
}
