import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';

interface Question { q: string; a: string; }
interface YearSixLesson {
  week: number; day: number; unit: string; slug: string; title: string; objective: string;
  modelQuestion: string; modelAnswer: string; guidedQuestion: string; guidedAnswer: string;
  practiceQuestion: string; practiceAnswer: string; challengeQuestion: string; challengeAnswer: string;
  misconception: string; correction: string; prior: string; vocabulary: string[]; resources: string;
  modelSteps: string[]; successCriteria: string[]; warmup: string; guided: string;
  independent: string; plenary: string;
  preteach: { focus: string; steps: string[]; questions: Question[] };
}
type PreviewKind = 'plan' | 'slides' | 'images';
interface ResourcePreview {
  title: string; kind: PreviewKind; download: string; description: string;
  folder?: string; start?: number; end?: number;
}

@Component({
  selector: 'bp-year6-autumn-lesson',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (lesson(); as item) {
      <header class="bp-page-hero lesson-hero"><div class="bp-container">
        <a class="back" [routerLink]="l('/curriculum/maths/year/6')">← Year 6 Maths curriculum map</a>
        <span class="bp-chip">Year 6 Maths · Autumn · Week {{ item.week }} · Day {{ item.day }}</span>
        <h1>{{ item.title }}</h1>
        <p><strong>LI:</strong> {{ item.objective }}</p>
      </div></header>

      <main class="bp-section"><div class="bp-container lesson-layout">
        <nav class="resource-card bp-card" aria-label="Lesson resources">
          <span class="bp-label">Complete lesson pack</span>
          <h2>Preview first, then download</h2>
          <p class="intro">Nothing downloads until you choose the download button inside a preview.</p>
          <div class="downloads">
            <button class="download" type="button" (click)="openPreview('plan')"><span>📝</span><b>Editable teacher plan</b><small>One-page, supply-ready Word plan</small></button>
            <button class="download" type="button" (click)="openPreview('slides')"><span>📽️</span><b>Teaching PowerPoint</b><small>12 slides · click-to-reveal animation</small></button>
            <button class="download" type="button" (click)="openPreview('preteach')"><span>🌱</span><b>Pre-teach</b><small>Prior learning and adult guide</small></button>
            <button class="download" type="button" (click)="openPreview('lower')"><span>●</span><b>Lower support</b><small>Scaffolded practice and answers</small></button>
            <button class="download" type="button" (click)="openPreview('expected')"><span>●●</span><b>Expected level</b><small>Core practice and answers</small></button>
            <button class="download" type="button" (click)="openPreview('higher')"><span>●●●</span><b>Higher challenge</b><small>Reasoning, depth and answers</small></button>
          </div>

          @if (preview(); as resource) {
            <section class="preview" aria-live="polite">
              <div class="preview__head"><div><span class="bp-label">Preview before download</span><h3>{{ resource.title }}</h3><p>{{ resource.description }}</p></div><button class="preview__close" type="button" (click)="closePreview()" aria-label="Close preview">×</button></div>
              @if (resource.kind === 'plan') {
                <div class="plan-preview">
                  <div class="plan-preview__title"><b>Year 6 Maths · Week {{ item.week }} Day {{ item.day }}</b><span>Teacher: __________ &nbsp; Date: __________</span></div>
                  <h4>LI: {{ item.objective }}</h4>
                  <div class="plan-columns">
                    <section><b>Resources and readiness</b><p>{{ item.resources }}</p><b>Previous learning / pre-teach</b><p>{{ item.prior }}</p></section>
                    <section><b>I do</b><p>{{ item.modelQuestion }} {{ item.modelAnswer }}</p><b>We do</b><p>{{ item.guidedQuestion }}</p><b>You do</b><p>{{ item.practiceQuestion }}</p></section>
                  </div>
                  <div class="plan-needs"><b>SEND / EAL / ADHD / ODD / individual needs</b><p>Editable space in the downloaded Word plan for pupil initials, reasonable adjustments, adult support and sensory or movement needs.</p></div>
                  <p><b>Assessment and misconception:</b> {{ item.misconception }} {{ item.correction }}</p>
                </div>
              } @else {
                <div class="image-preview"><img [src]="previewImageSrc()" [alt]="resource.title + ', page ' + previewPage()" /></div>
                <div class="preview-controls"><button type="button" (click)="changePage(-1)" [disabled]="previewPage() === (resource.start ?? 1)">← Previous</button><b>{{ resource.kind === 'slides' ? 'Slide' : 'Page' }} {{ displayPage() }} of {{ pageTotal() }}</b><button type="button" (click)="changePage(1)" [disabled]="previewPage() === (resource.end ?? 1)">Next →</button></div>
              }
              <div class="preview__actions"><span>Happy with the preview?</span><a class="bp-btn" [href]="asset(resource.download)" download>Download {{ resource.title }}</a></div>
            </section>
          }
        </nav>

        <section class="editor bp-card">
          <div class="editor__head"><div><span class="bp-label">Editable in your browser</span><h2>Class adaptations</h2></div><button class="bp-btn" type="button" (click)="saveDraft()">Save on this device</button></div>
          <p class="hint">Use these notes alongside the editable Word plan. They stay only on this device.</p>
          <div class="field-grid"><label>Teacher / class<input [(ngModel)]="draft.teacher" /></label><label>Date<input type="date" [(ngModel)]="draft.date" /></label></div>
          <label>Pupil initials / focus group<textarea rows="2" [(ngModel)]="draft.initials"></textarea></label>
          <label>SEND, EAL, ADHD, ODD and individual needs<textarea rows="3" [(ngModel)]="draft.send"></textarea></label>
          <label>Adaptations, reasonable adjustments and adult support<textarea rows="4" [(ngModel)]="draft.adaptations"></textarea></label>
          <label>Assessment notes and next steps<textarea rows="4" [(ngModel)]="draft.assessment"></textarea></label>
          @if (saved()) { <p class="saved" role="status">✓ Saved on this device</p> }
        </section>

        <section class="sequence">
          <span class="bp-label">Teaching before independent work</span><h2>I do · We do · You do</h2>
          <div class="sequence-grid">
            <article class="bp-card"><span>I do</span><h3>Explicit model</h3><p>{{ item.modelQuestion }}</p><ol>@for (step of item.modelSteps; track step) { <li>{{ step }}</li> }</ol><b>Answer: {{ item.modelAnswer }}</b></article>
            <article class="bp-card"><span>We do</span><h3>Guided practice</h3><p>{{ item.guidedQuestion }}</p><p>Question, discuss, record and then reveal: <b>{{ item.guidedAnswer }}</b></p></article>
            <article class="bp-card"><span>You do</span><h3>Independent check</h3><p>{{ item.practiceQuestion }}</p><p>Then deepen: {{ item.challengeQuestion }}</p></article>
          </div>
        </section>

        <aside class="preteach bp-card"><div><span class="bp-label">Before the lesson</span><h2>Pre-teach and previous learning</h2><p>{{ item.preteach.focus }}</p></div><ul>@for (step of item.preteach.steps; track step) { <li>✓ {{ step }}</li> }</ul></aside>
        <aside class="miro bp-card"><img src="/lessons/year-6-maths/shared/miro-misconception-character.png" alt="Miro, BrightPath's Year 6 misconception character" /><div><span class="bp-label">Miro’s misconception</span><h2>Can pupils correct Miro?</h2><p>{{ item.misconception }}</p><p><b>Teaching correction:</b> {{ item.correction }}</p></div></aside>
        <aside class="overview bp-card"><div><b>Success criteria</b><ul>@for (point of item.successCriteria; track point) { <li>{{ point }}</li> }</ul></div><div><b>Key vocabulary</b><p>{{ item.vocabulary.join(' · ') }}</p></div><div><b>Resources</b><p>{{ item.resources }}</p></div></aside>
      </div></main>
    } @else if (notFound()) {
      <main class="bp-section"><div class="bp-container bp-empty"><h1>Lesson not found</h1><p>Please return to the Year 6 Maths curriculum map.</p><a class="bp-btn" [routerLink]="l('/curriculum/maths/year/6')">Open the curriculum map</a></div></main>
    } @else { <div class="bp-loading"><span class="bp-spinner"></span> Loading the lesson pack…</div> }
  `,
  styles: [`
    .back{display:block;width:max-content;margin-bottom:1rem;font-weight:700}.lesson-hero p{max-width:58rem}.lesson-layout{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(320px,.92fr);gap:1.5rem}.resource-card,.editor,.preteach,.miro,.overview{padding:clamp(1.2rem,3vw,2rem)}.resource-card h2,.editor h2{margin:.35rem 0 .35rem}.intro,.hint{font-size:.88rem;color:var(--text-muted)}.downloads{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem;margin-top:1rem}.download{appearance:none;width:100%;font:inherit;text-align:left;display:grid;grid-template-columns:auto 1fr;column-gap:.7rem;align-items:center;border:1px solid var(--border);border-radius:12px;padding:.9rem;color:var(--text);background:var(--page-bg);cursor:pointer}.download:hover,.download:focus-visible{border-color:var(--brand-l);background:var(--brand-tint);outline:2px solid transparent}.download span{grid-row:1/3;color:var(--brand-d)}.download b{font-size:.9rem}.download small{color:var(--text-muted)}.preview{margin-top:1rem;border:1px solid var(--border);border-radius:16px;padding:1rem;background:var(--white)}.preview__head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}.preview__head h3{margin:.25rem 0}.preview__head p{margin:.25rem 0 .8rem;color:var(--text-muted);font-size:.86rem}.preview__close{border:0;background:var(--page-bg);border-radius:50%;width:2rem;height:2rem;font-size:1.25rem;cursor:pointer}.image-preview{background:var(--page-bg);border:1px solid var(--border);border-radius:12px;overflow:auto;max-height:650px}.image-preview img{display:block;width:100%;height:auto}.preview-controls{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-top:.75rem}.preview-controls button{border:1px solid var(--border);background:var(--white);border-radius:9px;padding:.55rem .75rem;cursor:pointer}.preview-controls button:disabled{opacity:.45;cursor:not-allowed}.preview__actions{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:.85rem}.preview__actions span{font-size:.86rem;color:var(--text-muted)}.plan-preview{border:1px solid var(--border);border-radius:12px;padding:1rem;background:#fffdf7;font-size:.78rem}.plan-preview__title{display:flex;justify-content:space-between;gap:1rem;border-bottom:2px solid var(--brand-d);padding-bottom:.5rem}.plan-preview h4{margin:.65rem 0;padding:.5rem;background:var(--brand-tint)}.plan-columns{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.plan-preview p{margin:.2rem 0 .6rem}.plan-needs{border:1px dashed var(--brand-d);padding:.5rem}.editor__head{display:flex;justify-content:space-between;align-items:start;gap:1rem}.editor .bp-btn{padding:.65rem 1rem;white-space:nowrap}label{display:block;font-weight:700;font-size:.82rem;margin-top:.85rem}label input,label textarea{font-weight:400;margin-top:.3rem}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}.saved{margin:.8rem 0 0;color:var(--accent-emerald);font-weight:700}.sequence{grid-column:1/-1}.sequence h2{margin:.35rem 0 1rem}.sequence-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}.sequence-grid article{padding:1.2rem}.sequence-grid article>span{display:inline-block;background:var(--brand-d);color:white;border-radius:999px;padding:.25rem .6rem;font-size:.78rem;font-weight:800}.sequence-grid h3{margin:.65rem 0}.sequence-grid p,.sequence-grid li{font-size:.9rem;color:var(--slate-600)}.sequence-grid ol{padding-left:1.1rem}.preteach{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:2rem;background:linear-gradient(135deg,var(--brand-tint),var(--white))}.preteach li{margin:.45rem 0}.miro{grid-column:1/-1;display:grid;grid-template-columns:120px 1fr;align-items:center;gap:1.5rem}.miro img{width:110px;height:130px;object-fit:contain}.miro h2{margin:.3rem 0}.overview{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}.overview ul{list-style:disc;padding-left:1rem}.overview p,.overview li{font-size:.9rem;color:var(--slate-600)}@media(max-width:950px){.lesson-layout{grid-template-columns:1fr}.resource-card,.editor,.sequence,.preteach,.miro,.overview{grid-column:1}.sequence-grid{grid-template-columns:1fr}.overview{grid-template-columns:1fr}}@media(max-width:560px){.downloads,.field-grid,.preteach,.plan-columns{grid-template-columns:1fr}.editor__head{display:block}.editor .bp-btn{margin-top:.5rem;width:100%;justify-content:center}.preview__actions,.preview-controls{align-items:stretch;flex-direction:column}.preview__actions .bp-btn,.preview-controls button{width:100%;justify-content:center}.plan-preview__title{display:block}.miro{grid-template-columns:72px 1fr}.miro img{width:68px;height:90px}}
  `],
})
export class Year6AutumnLessonComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private lang = inject(LanguageService);
  readonly week = Number(this.route.snapshot.paramMap.get('week') ?? 1);
  readonly slug = this.route.snapshot.paramMap.get('slug') ?? '';
  readonly lesson = signal<YearSixLesson | null>(null);
  readonly notFound = signal(false);
  readonly saved = signal(false);
  readonly preview = signal<ResourcePreview | null>(null);
  readonly previewPage = signal(1);
  draft = { teacher: '', date: '', initials: '', send: '', adaptations: '', assessment: '' };

  constructor() {
    this.http.get<YearSixLesson[]>('/lessons/year-6-maths/autumn/year6-autumn-lessons.json').subscribe({
      next: items => {
        const item = items.find(candidate => candidate.week === this.week && candidate.slug === this.slug) ?? null;
        this.lesson.set(item); this.notFound.set(!item); if (item) this.loadDraft();
      },
      error: () => this.notFound.set(true),
    });
  }

  l(path: string): string { return this.lang.localise(path); }
  asset(file: string): string { return `/lessons/year-6-maths/autumn/week-${this.week}/${this.slug}/${file}`; }
  private key(): string { return `brightpath-year6-autumn-${this.week}-${this.slug}`; }
  private loadDraft(): void { try { const value = localStorage.getItem(this.key()); if (value) this.draft = { ...this.draft, ...JSON.parse(value) }; } catch {} }
  saveDraft(): void { try { localStorage.setItem(this.key(), JSON.stringify(this.draft)); this.saved.set(true); setTimeout(() => this.saved.set(false), 2500); } catch {} }

  openPreview(kind: 'plan' | 'slides' | 'preteach' | 'lower' | 'expected' | 'higher'): void {
    const resources: Record<typeof kind, ResourcePreview> = {
      plan: { title: 'Editable teacher plan', kind: 'plan', download: 'editable-teacher-plan.docx', description: 'A one-page, supply-teacher-ready plan with editable class, inclusion, assessment and resource fields.' },
      slides: { title: 'Teaching PowerPoint', kind: 'slides', download: 'teaching-powerpoint-v1.pptx', description: 'Twelve clear teaching slides using I do, We do and You do. In PowerPoint, teaching points appear one by one on click.', folder: 'preview/powerpoint', start: 1, end: 12 },
      preteach: { title: 'Pre-teach resource', kind: 'images', download: 'pre-teach.pdf', description: 'Two-page prior-learning intervention with pupil questions and an adult answer page.', folder: 'preview/preteach', start: 1, end: 2 },
      lower: { title: 'Lower support worksheet', kind: 'images', download: 'differentiated-worksheets.pdf', description: 'Scaffolded questions followed by answers. The download contains all three levels.', folder: 'preview/worksheets', start: 1, end: 2 },
      expected: { title: 'Expected level worksheet', kind: 'images', download: 'differentiated-worksheets.pdf', description: 'Core Year 6 practice followed by answers. The download contains all three levels.', folder: 'preview/worksheets', start: 3, end: 4 },
      higher: { title: 'Higher challenge worksheet', kind: 'images', download: 'differentiated-worksheets.pdf', description: 'Reasoning and depth followed by answers. The download contains all three levels.', folder: 'preview/worksheets', start: 5, end: 6 },
    };
    const resource = resources[kind]; this.preview.set(resource); this.previewPage.set(resource.start ?? 1);
    setTimeout(() => document.querySelector('.preview')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }
  closePreview(): void { this.preview.set(null); this.previewPage.set(1); }
  changePage(delta: number): void { const resource = this.preview(); if (!resource) return; this.previewPage.set(Math.min(resource.end ?? 1, Math.max(resource.start ?? 1, this.previewPage() + delta))); }
  previewImageSrc(): string { const resource = this.preview(); return resource?.folder ? this.asset(`${resource.folder}/${resource.kind === 'slides' ? 'slide' : 'page'}-${this.previewPage()}.png`) : ''; }
  displayPage(): number { const start = this.preview()?.start ?? 1; return this.previewPage() - start + 1; }
  pageTotal(): number { const resource = this.preview(); return resource ? (resource.end ?? 1) - (resource.start ?? 1) + 1 : 1; }
}
