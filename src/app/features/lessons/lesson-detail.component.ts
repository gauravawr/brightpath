import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { imageUrl } from '../../shared/image-url';
import { Lesson } from '../../shared/models/content.models';

@Component({
  selector: 'bp-lesson-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <div class="bp-loading" style="min-height:50vh"><span class="bp-spinner"></span> Loading…</div>
    } @else if (!lesson()) {
      <div class="bp-empty" style="min-height:50vh"><h3>Lesson not found</h3>
        <a class="bp-btn" [routerLink]="l('/lessons')">Back to lessons</a></div>
    } @else {
      <article class="lesson">
        <header class="bp-page-hero">
          <div class="bp-container">
            <a class="crumb" [routerLink]="l('/subjects/' + lesson()!.subjectSlug)">← {{ lesson()!.subjectSlug }}</a>
            <h1>{{ lesson()!.title }}</h1>
            <div class="lesson__meta">
              @if (lesson()!.teacher.displayName) { <span class="bp-meta-chip">By {{ lesson()!.teacher.displayName }}</span> }
              @if (lesson()!.durationMinutes) { <span class="bp-meta-chip">{{ lesson()!.durationMinutes }} min</span> }
              @if (lesson()!.level) { <span class="bp-meta-chip">{{ lesson()!.level }}</span> }
            </div>
          </div>
        </header>

        <div class="bp-container lesson__body">
          @if (lesson()!.videoUrl) {
            <div class="lesson__video">
              <iframe [src]="safeVideo()" title="Lesson video" frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          } @else if (lesson()!.coverImageUrl) {
            <img class="lesson__cover" [src]="cover()" [alt]="lesson()!.title" />
          }
          <div class="prose" [innerHTML]="body()"></div>

          @if (lesson()!.attachments?.length) {
            <section class="dl">
              <h2 class="dl__h">Lesson materials</h2>
              <ul class="dl__list">
                @for (a of lesson()!.attachments; track a.id) {
                  <li>
                    <a class="dl__item" [href]="a.url" target="_blank" rel="noopener">
                      <span class="dl__icon" aria-hidden="true">{{ icon(a.kind) }}</span>
                      <span class="dl__meta">
                        <span class="dl__name">{{ a.fileName }}</span>
                        <span class="dl__size">{{ fmtSize(a.sizeBytes) }}</span>
                      </span>
                      <span class="dl__go" aria-hidden="true">↓</span>
                    </a>
                  </li>
                }
              </ul>
            </section>
          }
        </div>
      </article>
    }
  `,
  styles: [`
    .crumb { font-size: .82rem; font-weight: 600; color: var(--brand-d); }
    .lesson__meta { display: flex; gap: .4rem; flex-wrap: wrap; margin-top: .8rem; }
    .lesson__body { max-width: 760px; padding-block: clamp(28px, 5vw, 48px); }
    .lesson__video { position: relative; aspect-ratio: 16/9; border-radius: var(--r-md); overflow: hidden; box-shadow: var(--shadow-card); margin-bottom: 1.6rem; }
    .lesson__video iframe { position: absolute; inset: 0; width: 100%; height: 100%; }
    .lesson__cover { width: 100%; border-radius: var(--r-md); box-shadow: var(--shadow-card); margin-bottom: 1.6rem; }
    .prose { font-size: 1.05rem; line-height: 1.75; color: var(--slate-700); }
    .prose :is(h2,h3) { color: var(--slate-900); margin-top: 1.6em; }
    .prose img { border-radius: var(--r-sm); margin: 1rem 0; }
    .prose a { color: var(--brand-d); text-decoration: underline; }

    .dl { margin-top: 2.4rem; }
    .dl__h { font-size: 1.15rem; margin: 0 0 .8rem; color: var(--slate-900); }
    .dl__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .6rem; }
    .dl__item {
      display: flex; align-items: center; gap: .9rem; min-width: 0;
      padding: .8rem 1rem; border: 1px solid var(--border); border-radius: var(--r-md);
      background: var(--white); text-decoration: none; color: inherit;
      transition: border-color .15s, box-shadow .15s, transform .15s;
    }
    .dl__item:hover { border-color: var(--brand-l); box-shadow: var(--shadow-card); transform: translateY(-1px); }
    .dl__icon { font-size: 1.4rem; flex: none; }
    .dl__meta { display: flex; flex-direction: column; min-width: 0; flex: 1; }
    .dl__name { font-weight: 600; color: var(--slate-900); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dl__size { font-size: .8rem; color: var(--slate-500); font-variant-numeric: tabular-nums; }
    .dl__go { flex: none; color: var(--brand-d); font-weight: 800; font-size: 1.1rem; }
  `],
})
export class LessonDetailComponent {
  private route = inject(ActivatedRoute);
  private content = inject(ContentService);
  private lang = inject(LanguageService);
  private sanitizer = inject(DomSanitizer);
  readonly lesson = signal<Lesson | null>(null);
  readonly loading = signal(true);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.content.lesson(slug).subscribe({
      next: l => { this.lesson.set(l); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  body(): SafeHtml { return this.sanitizer.bypassSecurityTrustHtml(this.lesson()?.bodyHtml ?? ''); }
  safeVideo(): SafeResourceUrl { return this.sanitizer.bypassSecurityTrustResourceUrl(this.lesson()?.videoUrl ?? ''); }
  cover(): string { return imageUrl(this.lesson()?.coverImageUrl, 'og'); }

  icon(kind: string): string {
    return kind === 'slides' ? '📊' : kind === 'image' ? '🖼️' : '📄';
  }
  fmtSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  l(p: string): string { return this.lang.localise(p); }
}
