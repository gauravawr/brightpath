import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { lessonFileUrl, downloadFile, powerPointViewerUrl } from '../../shared/lesson-files';

interface LessonSummary {
  week?: number;
  slug: string;
  title: string;
  teachingSlides?: { count: number };
}

@Component({
  selector: 'bp-maths-presentation',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="presenter" [class.slideshow]="slideshow()">
      <header class="presenter__bar">
        <div>
          <span>Year {{ year }} Maths</span>
          <h1>{{ title() }}</h1>
        </div>
        <nav aria-label="Presentation actions">
          <a [routerLink]="lessonRoute()">Back to lesson</a>
          <button type="button" (click)="downloadFile(powerPointUrl())">Download editable PowerPoint</button>
          <a class="start" [href]="animatedPowerPointUrl()" target="_blank" rel="noopener">▶ Play animated slideshow</a>
          <button type="button" (click)="startSlideshow()">Open image fallback</button>
        </nav>
      </header>

      @if (error()) {
        <section class="message" role="alert">
          <h2>These slides could not be opened</h2>
          <p>Please return to the lesson and try again.</p>
          <a [routerLink]="lessonRoute()">Return to lesson</a>
        </section>
      } @else {
        <section class="stage" aria-live="polite" (click)="advanceFromStage()">
          <img [src]="slideUrl()" [alt]="title() + ', slide ' + slide()" (error)="imageFailed()" />
        </section>
        <footer class="controls">
          <button type="button" (click)="changeSlide(-1)" [disabled]="slide() === 1" aria-label="Previous slide">← Previous</button>
          <strong>Slide {{ slide() }} of {{ slideCount() }}</strong>
          <button type="button" (click)="changeSlide(1)" [disabled]="slide() === slideCount()" aria-label="Next slide">Next →</button>
          @if (slideshow()) { <button class="exit" type="button" (click)="exitSlideshow()">Exit slideshow</button> }
        </footer>
      }
    </main>
  `,
  styles: [`
    :host{position:fixed;inset:0;z-index:20000;background:#09182b;color:#fff}.presenter{height:100dvh;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden}.presenter__bar{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.75rem 1rem;background:#102947;border-bottom:1px solid #42668f}.presenter__bar span{font-size:.75rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#bcd3ed}.presenter__bar h1{margin:.15rem 0 0;font-size:clamp(1rem,2vw,1.35rem);color:#fff}.presenter__bar nav{display:flex;align-items:center;gap:.65rem}.presenter__bar a,.presenter__bar button,.controls button,.message a{display:inline-flex;align-items:center;justify-content:center;border:1px solid #8ca9c9;border-radius:9px;padding:.6rem .8rem;background:#fff;color:#12345b;font:inherit;font-size:.85rem;font-weight:800;text-decoration:none;cursor:pointer}.presenter__bar .start{border-color:#ffd166;background:#ffd166;color:#172942}.stage{min-height:0;display:grid;place-items:center;padding:.75rem;background:#09182b}.stage img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;aspect-ratio:16/9;object-fit:contain;border:1px solid #55789e;border-radius:10px;background:#fff;box-shadow:0 12px 40px #0008}.controls{display:flex;align-items:center;justify-content:center;gap:1rem;padding:.75rem 1rem;background:#102947;border-top:1px solid #42668f}.controls strong{min-width:9rem;text-align:center}.controls button:disabled{opacity:.4;cursor:not-allowed}.message{align-self:center;justify-self:center;text-align:center;padding:2rem}.message h2{color:#fff}.message p{color:#c9daec}.message a{margin-top:.75rem}.presenter.slideshow{grid-template-rows:minmax(0,1fr) auto;background:#000}.presenter.slideshow .presenter__bar{display:none}.presenter.slideshow .stage{padding:0;background:#000;cursor:pointer}.presenter.slideshow .stage img{width:100%;height:100%;border:0;border-radius:0;box-shadow:none}.presenter.slideshow .controls{position:absolute;right:0;bottom:0;left:0;border:0;background:linear-gradient(transparent,#000b);opacity:.12;transition:opacity .18s}.presenter.slideshow .controls:hover,.presenter.slideshow .controls:focus-within{opacity:1}.presenter.slideshow .exit{margin-left:1rem}@media(max-width:650px){.presenter__bar{align-items:flex-start}.presenter__bar nav{flex-direction:column;align-items:stretch}.presenter__bar a,.presenter__bar button{padding:.45rem .6rem;font-size:.72rem}.controls{gap:.5rem}.controls strong{min-width:auto;font-size:.8rem}.controls button{padding:.5rem .6rem;font-size:.75rem}.stage{padding:.4rem}.presenter.slideshow .exit{margin-left:0}}
  `],
})
export class MathsPresentationComponent {
  readonly downloadFile = downloadFile;
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  readonly year = Number(this.route.snapshot.paramMap.get('year') ?? 1);
  readonly week = Number(this.route.snapshot.paramMap.get('week') ?? 1);
  readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';
  readonly lang = this.route.snapshot.parent?.paramMap.get('lang') ?? 'en';
  readonly title = signal('Teaching PowerPoint');
  readonly slideCount = signal(this.year === 6 ? 12 : 14);
  readonly slide = signal(1);
  readonly slideshow = signal(false);
  readonly error = signal(false);

  constructor() {
    this.http.get<LessonSummary[]>(this.dataUrl()).subscribe({
      next: lessons => {
        const lesson = lessons.find(item => item.slug === this.slug && (this.year !== 6 || item.week === this.week));
        if (!lesson) { this.error.set(true); return; }
        this.title.set(lesson.title);
        this.slideCount.set(lesson.teachingSlides?.count ?? this.slideCount());
      },
      error: () => this.error.set(true),
    });
  }

  @HostListener('window:keydown.arrowleft') previous(): void { this.changeSlide(-1); }
  @HostListener('window:keydown.arrowright') next(): void { this.changeSlide(1); }
  @HostListener('window:keydown.space', ['$event']) space(event: Event): void { if (this.slideshow()) { event.preventDefault(); this.changeSlide(1); } }
  @HostListener('document:fullscreenchange') fullscreenChanged(): void { if (!document.fullscreenElement) this.slideshow.set(false); }

  changeSlide(delta: number): void {
    this.slide.set(Math.min(this.slideCount(), Math.max(1, this.slide() + delta)));
  }

  imageFailed(): void { this.error.set(true); }

  async startSlideshow(): Promise<void> {
    this.slideshow.set(true);
    try { await document.documentElement.requestFullscreen?.(); } catch { /* The browser view still switches to slideshow mode. */ }
  }

  async exitSlideshow(): Promise<void> {
    this.slideshow.set(false);
    if (document.fullscreenElement) await document.exitFullscreen();
  }

  advanceFromStage(): void { if (this.slideshow()) this.changeSlide(1); }

  lessonRoute(): string {
    return this.year === 6
      ? `/${this.lang}/lessons/year-6-maths/week/${this.week}/${this.slug}`
      : `/${this.lang}/lessons/year-${this.year}-maths/week-${this.week}/${this.slug}`;
  }

  slideUrl(): string { return lessonFileUrl(`${this.lessonFolder()}/preview/powerpoint/slide-${this.slide()}.png`); }
  powerPointUrl(): string { return lessonFileUrl(`${this.lessonFolder()}/${this.year === 6 ? 'teaching-powerpoint-v1.pptx' : 'interactive-teaching-slides.pptx'}`); }
  animatedPowerPointUrl(): string { return powerPointViewerUrl(this.powerPointUrl()); }

  private lessonFolder(): string {
    if (this.year === 6) return `year-6-maths/${this.termSlug()}/week-${this.week}/${this.slug}`;
    return `year-${this.year}-maths/week-${this.week}/${this.slug}`;
  }

  private dataUrl(): string {
    if (this.year === 6) return lessonFileUrl(`year-6-maths/${this.termSlug()}/year6-${this.termSlug()}-lessons.json`);
    return lessonFileUrl(`year-${this.year}-maths/week-${this.week}/week${this.week}-lessons.json`);
  }

  private termSlug(): string { return this.week <= 10 ? 'autumn' : this.week <= 20 ? 'spring' : 'summer'; }
}
