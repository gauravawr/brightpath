import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';

interface ScoreBand {
  name: string;
  minimum: number;
  maximum: number;
  guidance: string;
}

interface EvaluationMetadata {
  term: string;
  totalMarks: number;
  assessmentPages: number;
  recordPages: number;
  bands: ScoreBand[];
}

interface PupilEvaluation {
  name: string;
  score: number | null;
  secure: string;
  gap: string;
  intervention: string;
  review: string;
}

interface EvaluationPreview {
  title: string;
  download: string;
  description: string;
  folder: string;
  start: number;
  end: number;
}

@Component({
  selector: 'bp-year6-term-evaluation',
  standalone: true,
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (metadata(); as data) {
      <header class="bp-page-hero evaluation-hero"><div class="bp-container">
        <a class="back" [routerLink]="l('/curriculum/maths/year/6')">← Year 6 Maths curriculum map</a>
        <span class="bp-chip">Year 6 Maths · {{ data.term }} term</span>
        <h1>Term evaluation and intervention record</h1>
        <p>Assess the term, place scores into a starting group, review question-level evidence and record the support each pupil needs next.</p>
      </div></header>

      <main class="bp-section"><div class="bp-container evaluation-layout">
        <section class="resources bp-card">
          <span class="bp-label">Preview before download</span>
          <h2>{{ data.term }} evaluation pack</h2>
          <p>The assessment totals {{ data.totalMarks }} marks. Nothing downloads until you choose a download button inside the preview.</p>
          <div class="resource-buttons">
            <button type="button" (click)="openPreview('assessment')"><span>✓</span><b>Term assessment</b><small>Questions, mark scheme and score guidance</small></button>
            <button type="button" (click)="openPreview('record')"><span>📝</span><b>Editable teacher record</b><small>Word document for 30 pupils</small></button>
          </div>

          @if (preview(); as resource) {
            <section class="preview" aria-live="polite">
              <div class="preview-head"><div><span class="bp-label">Preview</span><h3>{{ resource.title }}</h3><p>{{ resource.description }}</p></div><button class="close" type="button" (click)="closePreview()" aria-label="Close preview">×</button></div>
              <div class="image-preview"><img [src]="previewImageSrc()" [alt]="resource.title + ', page ' + displayPage()" /></div>
              <div class="preview-controls"><button type="button" (click)="changePage(-1)" [disabled]="previewPage() === resource.start">← Previous</button><b>Page {{ displayPage() }} of {{ pageTotal() }}</b><button type="button" (click)="changePage(1)" [disabled]="previewPage() === resource.end">Next →</button></div>
              <div class="preview-actions"><span>Happy with the preview?</span><a class="bp-btn" [href]="asset(resource.download)" download>Download {{ resource.title }}</a></div>
            </section>
          }
        </section>

        <section class="bands bp-card">
          <span class="bp-label">Starting point for teacher judgement</span>
          <h2>Score pattern</h2>
          <div class="band-list">
            @for (band of data.bands; track band.name) {
              <article [class]="'band band--' + band.name.toLowerCase()">
                <div><b>{{ band.name }}</b><strong>{{ band.minimum }}-{{ band.maximum }} / {{ data.totalMarks }}</strong></div>
                <p>{{ band.guidance }}</p>
              </article>
            }
          </div>
          <p class="judgement"><b>Important:</b> use the band with question-level evidence, classroom work and reasonable adjustments. The score supports teacher judgement and does not replace it.</p>
        </section>

        <section class="tracker bp-card">
          <div class="tracker-head"><div><span class="bp-label">Editable in your browser</span><h2>Pupil evaluation and intervention tracker</h2></div><button class="bp-btn" type="button" (click)="save()">Save on this device</button></div>
          <p>Enter each pupil's score. BrightPath shows the score band automatically. Add the secure knowledge, gap, intervention and review evidence so support follows the assessment.</p>
          <div class="class-fields"><label>Teacher and class<input [(ngModel)]="teacherClass" /></label><label>Assessment date<input type="date" [(ngModel)]="assessmentDate" /></label><label>Review date<input type="date" [(ngModel)]="reviewDate" /></label></div>

          <div class="summary" aria-label="Group totals">
            @for (band of data.bands; track band.name) { <span><b>{{ band.name }}</b> {{ countBand(band.name) }}</span> }
          </div>

          <div class="table-wrap">
            <table>
              <thead><tr><th>#</th><th>Pupil</th><th>Score /{{ data.totalMarks }}</th><th>Band</th><th>Secure knowledge</th><th>Misconception or gap</th><th>Intervention and adult support</th><th>Review evidence</th></tr></thead>
              <tbody>
                @for (row of pupils; track $index; let index = $index) {
                  <tr>
                    <td>{{ index + 1 }}</td>
                    <td><input aria-label="Pupil name" [(ngModel)]="row.name" /></td>
                    <td><input aria-label="Score" type="number" min="0" [max]="data.totalMarks" [(ngModel)]="row.score" /></td>
                    <td><span [class]="'auto-band auto-band--' + scoreBand(row.score).toLowerCase()">{{ scoreBand(row.score) || '—' }}</span></td>
                    <td><textarea aria-label="Secure knowledge" rows="2" [(ngModel)]="row.secure"></textarea></td>
                    <td><textarea aria-label="Misconception or gap" rows="2" [(ngModel)]="row.gap"></textarea></td>
                    <td><textarea aria-label="Intervention and adult support" rows="2" [(ngModel)]="row.intervention"></textarea></td>
                    <td><textarea aria-label="Review evidence" rows="2" [(ngModel)]="row.review"></textarea></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (saved()) { <p class="saved" role="status">✓ Evaluation record saved on this device</p> }
        </section>
      </div></main>
    } @else if (notFound()) {
      <main class="bp-section"><div class="bp-container bp-empty"><h1>Evaluation pack not found</h1><a class="bp-btn" [routerLink]="l('/curriculum/maths/year/6')">Return to Year 6 Maths</a></div></main>
    } @else { <div class="bp-loading"><span class="bp-spinner"></span> Loading the evaluation pack…</div> }
  `,
  styles: [`
    .back{display:block;width:max-content;margin-bottom:1rem;font-weight:700}.evaluation-hero p{max-width:60rem}.evaluation-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:1.5rem}.resources,.bands,.tracker{padding:clamp(1.2rem,3vw,2rem)}.resources h2,.bands h2,.tracker h2{margin:.35rem 0}.resources>p,.tracker>p{color:var(--text-muted);font-size:.9rem}.resource-buttons{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-top:1rem}.resource-buttons button{appearance:none;display:grid;grid-template-columns:auto 1fr;align-items:center;column-gap:.7rem;width:100%;padding:.9rem;border:1px solid var(--border);border-radius:12px;background:var(--page-bg);font:inherit;text-align:left;cursor:pointer}.resource-buttons button:hover{border-color:var(--brand-l);background:var(--brand-tint)}.resource-buttons button span{grid-row:1/3;color:var(--brand-d)}.resource-buttons button b{font-size:.9rem}.resource-buttons button small{color:var(--text-muted)}.preview{margin-top:1rem;padding:1rem;border:1px solid var(--border);border-radius:16px}.preview-head{display:flex;justify-content:space-between;gap:1rem}.preview-head h3{margin:.25rem 0}.preview-head p{margin:.25rem 0 .8rem;color:var(--text-muted);font-size:.86rem}.close{width:2rem;height:2rem;border:0;border-radius:50%;background:var(--page-bg);font-size:1.2rem;cursor:pointer}.image-preview{max-height:650px;overflow:auto;border:1px solid var(--border);border-radius:12px;background:var(--page-bg)}.image-preview img{display:block;width:100%;height:auto}.preview-controls,.preview-actions{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-top:.75rem}.preview-controls button{padding:.55rem .75rem;border:1px solid var(--border);border-radius:9px;background:var(--white);cursor:pointer}.preview-controls button:disabled{opacity:.45}.preview-actions span{font-size:.86rem;color:var(--text-muted)}.band-list{display:grid;gap:.65rem;margin-top:1rem}.band{padding:.85rem;border-left:5px solid var(--brand-d);border-radius:0 10px 10px 0;background:var(--page-bg)}.band>div{display:flex;justify-content:space-between;gap:.75rem}.band strong{color:var(--brand-d);font-size:.85rem}.band p{margin:.3rem 0 0;color:var(--slate-600);font-size:.82rem}.band--cuspy{border-color:#b7791f}.band--higher{border-color:#2f785d}.judgement{margin:1rem 0 0;color:var(--text-muted);font-size:.8rem}.tracker{grid-column:1/-1}.tracker-head{display:flex;justify-content:space-between;align-items:start;gap:1rem}.class-fields{display:grid;grid-template-columns:2fr 1fr 1fr;gap:.75rem}.class-fields label{font-size:.82rem;font-weight:700}.class-fields input{margin-top:.3rem}.summary{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0}.summary span{padding:.4rem .65rem;border-radius:999px;background:var(--brand-tint);font-size:.8rem}.table-wrap{overflow:auto;border:1px solid var(--border);border-radius:12px}table{width:100%;min-width:1250px;border-collapse:collapse}th,td{padding:.55rem;border-bottom:1px solid var(--border);border-right:1px solid var(--border);text-align:left;vertical-align:middle}th{background:var(--slate-900);color:var(--white);font-size:.72rem}td:first-child{width:2rem;text-align:center;font-weight:800}td:nth-child(3){width:5rem}td:nth-child(4){width:6rem}td input,td textarea{min-width:120px;border:1px solid var(--border);border-radius:7px;padding:.45rem;font:inherit}td:nth-child(2) input{min-width:110px}.auto-band{display:inline-block;padding:.25rem .45rem;border-radius:999px;background:var(--page-bg);font-size:.74rem;font-weight:800}.auto-band--lower{color:#9b1c24}.auto-band--cuspy{color:#8b5a12}.auto-band--expected{color:var(--brand-d)}.auto-band--higher{color:#246049}.saved{margin:.8rem 0 0;color:var(--accent-emerald);font-weight:800}@media(max-width:900px){.evaluation-layout{grid-template-columns:1fr}.tracker{grid-column:1}.class-fields{grid-template-columns:1fr}.tracker-head{display:block}.tracker-head .bp-btn{width:100%;justify-content:center;margin-top:.6rem}}@media(max-width:560px){.resource-buttons{grid-template-columns:1fr}.preview-controls,.preview-actions{align-items:stretch;flex-direction:column}.preview-actions .bp-btn,.preview-controls button{width:100%;justify-content:center}}
  `],
})
export class Year6TermEvaluationComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private lang = inject(LanguageService);
  readonly termSlug = (this.route.snapshot.paramMap.get('term') ?? '').toLowerCase();
  readonly metadata = signal<EvaluationMetadata | null>(null);
  readonly notFound = signal(false);
  readonly saved = signal(false);
  readonly preview = signal<EvaluationPreview | null>(null);
  readonly previewPage = signal(1);
  teacherClass = '';
  assessmentDate = '';
  reviewDate = '';
  pupils: PupilEvaluation[] = Array.from({ length: 30 }, () => ({ name: '', score: null, secure: '', gap: '', intervention: '', review: '' }));

  constructor() {
    if (!['autumn', 'spring', 'summer'].includes(this.termSlug)) {
      this.notFound.set(true);
      return;
    }
    this.http.get<EvaluationMetadata>(`/lessons/year-6-maths/evaluations/${this.termSlug}/evaluation.json`).subscribe({
      next: data => { this.metadata.set(data); this.load(); },
      error: () => this.notFound.set(true),
    });
  }

  l(path: string): string { return this.lang.localise(path); }
  asset(file: string): string { return `/lessons/year-6-maths/evaluations/${this.termSlug}/${file}`; }
  scoreBand(score: number | null): string {
    if (score === null || score === undefined || Number.isNaN(Number(score))) return '';
    const value = Math.max(0, Math.min(40, Number(score)));
    return this.metadata()?.bands.find(band => value >= band.minimum && value <= band.maximum)?.name ?? '';
  }
  countBand(name: string): number { return this.pupils.filter(row => this.scoreBand(row.score) === name).length; }
  openPreview(kind: 'assessment' | 'record'): void {
    const resources: Record<typeof kind, EvaluationPreview> = {
      assessment: { title: 'Term assessment', download: 'term-assessment-and-mark-scheme.pdf', description: 'Two pupil pages, two answer pages and a score-band intervention guide.', folder: 'preview/assessment', start: 1, end: 5 },
      record: { title: 'Editable teacher evaluation record', download: 'editable-teacher-evaluation-record.docx', description: 'Two editable Word pages with space for 30 pupils, evidence and intervention planning.', folder: 'preview/teacher-record', start: 1, end: 2 },
    };
    this.preview.set(resources[kind]);
    this.previewPage.set(1);
    setTimeout(() => document.querySelector('.preview')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }
  closePreview(): void { this.preview.set(null); this.previewPage.set(1); }
  changePage(delta: number): void { const resource = this.preview(); if (resource) this.previewPage.set(Math.min(resource.end, Math.max(resource.start, this.previewPage() + delta))); }
  displayPage(): number { const resource = this.preview(); return resource ? this.previewPage() - resource.start + 1 : 1; }
  pageTotal(): number { const resource = this.preview(); return resource ? resource.end - resource.start + 1 : 1; }
  previewImageSrc(): string { const resource = this.preview(); return resource ? this.asset(`${resource.folder}/page-${this.previewPage()}.png`) : ''; }
  save(): void {
    try {
      localStorage.setItem(this.key(), JSON.stringify({ teacherClass: this.teacherClass, assessmentDate: this.assessmentDate, reviewDate: this.reviewDate, pupils: this.pupils }));
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2500);
    } catch {}
  }
  private key(): string { return `brightpath-year6-${this.termSlug}-evaluation`; }
  private load(): void {
    try {
      const value = localStorage.getItem(this.key());
      if (!value) return;
      const saved = JSON.parse(value);
      this.teacherClass = saved.teacherClass ?? '';
      this.assessmentDate = saved.assessmentDate ?? '';
      this.reviewDate = saved.reviewDate ?? '';
      if (Array.isArray(saved.pupils)) this.pupils = this.pupils.map((row, index) => ({ ...row, ...(saved.pupils[index] ?? {}) }));
    } catch {}
  }
}
