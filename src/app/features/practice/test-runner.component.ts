import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TestPaper, Question, AttemptResult } from '../../shared/models/content.models';

type Phase = 'loading' | 'intro' | 'taking' | 'submitting' | 'result' | 'notfound';

@Component({
  selector: 'bp-test-runner',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './test-runner.component.html',
  styleUrl: './test-runner.component.scss',
})
export class TestRunnerComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private content = inject(ContentService);
  private lang = inject(LanguageService);
  private analytics = inject(AnalyticsService);

  readonly phase = signal<Phase>('loading');
  readonly paper = signal<TestPaper | null>(null);
  readonly result = signal<AttemptResult | null>(null);
  readonly index = signal(0);
  readonly answers = signal<Record<number, { opts: number[]; text: string }>>({});
  readonly secondsLeft = signal<number | null>(null);
  readonly submitError = signal(false);

  private timer?: ReturnType<typeof setInterval>;
  private elapsed = 0;

  readonly current = computed<Question | null>(() => this.paper()?.questions[this.index()] ?? null);
  readonly total = computed(() => this.paper()?.questions.length ?? 0);
  readonly answeredCount = computed(() => Object.values(this.answers()).filter(a => a.opts.length || a.text.trim()).length);

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.content.paper(slug).subscribe({
      next: p => { this.paper.set(p); this.phase.set('intro'); },
      error: () => this.phase.set('notfound'),
    });
  }

  ngOnDestroy(): void { this.stopTimer(); }

  l(p: string): string { return this.lang.localise(p); }

  start(): void {
    const p = this.paper();
    if (!p) return;
    this.phase.set('taking');
    this.analytics.track('activated', { paper: p.slug });
    if (p.durationMinutes) {
      this.secondsLeft.set(p.durationMinutes * 60);
      this.timer = setInterval(() => {
        this.elapsed++;
        const left = (this.secondsLeft() ?? 1) - 1;
        this.secondsLeft.set(left);
        if (left <= 0) { this.submit(); }
      }, 1000);
    } else {
      this.timer = setInterval(() => this.elapsed++, 1000);
    }
  }

  private ans(qid: number) {
    return this.answers()[qid] ?? { opts: [], text: '' };
  }
  isSelected(qid: number, oid: number): boolean { return this.ans(qid).opts.includes(oid); }
  textOf(qid: number): string { return this.ans(qid).text; }

  select(q: Question, oid: number): void {
    const cur = this.ans(q.id);
    let opts: number[];
    if (q.type === 'multiple') {
      opts = cur.opts.includes(oid) ? cur.opts.filter(x => x !== oid) : [...cur.opts, oid];
    } else {
      opts = [oid];
    }
    this.answers.set({ ...this.answers(), [q.id]: { ...cur, opts } });
  }
  setText(q: Question, text: string): void {
    const cur = this.ans(q.id);
    this.answers.set({ ...this.answers(), [q.id]: { ...cur, text } });
  }

  prev(): void { this.index.update(i => Math.max(0, i - 1)); }
  next(): void { this.index.update(i => Math.min(this.total() - 1, i + 1)); }
  goTo(i: number): void { this.index.set(i); }
  isAnswered(qid: number): boolean { const a = this.ans(qid); return a.opts.length > 0 || a.text.trim().length > 0; }

  fmtTime(s: number | null): string {
    if (s === null) return '';
    const m = Math.floor(Math.max(0, s) / 60), sec = Math.max(0, s) % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  submit(): void {
    const p = this.paper();
    if (!p || this.phase() === 'submitting' || this.phase() === 'result') return;
    this.stopTimer();
    this.phase.set('submitting');
    this.submitError.set(false);

    const answers = p.questions.map(q => {
      const a = this.ans(q.id);
      return { questionId: q.id, selectedOptionIds: a.opts, textAnswer: a.text };
    });

    this.content.submitAttempt({ paperSlug: p.slug, answers, elapsedSeconds: this.elapsed }).subscribe({
      next: r => { this.result.set(r); this.phase.set('result'); this.analytics.track('paid', { kind: 'attempt', paper: p.slug, pct: r.percentage }); },
      error: () => { this.submitError.set(true); this.phase.set('taking'); },
    });
  }

  private stopTimer(): void { if (this.timer) { clearInterval(this.timer); this.timer = undefined; } }

  // result helpers
  breakdownFor(qid: number) { return this.result()?.breakdown.find(b => b.questionId === qid); }
  optionText(q: Question, oid: number): string { return q.options?.find(o => o.id === oid)?.text ?? ''; }

  headline(pct: number): string {
    if (pct >= 90) return 'Outstanding!';
    if (pct >= 70) return 'Well done!';
    if (pct >= 50) return 'Good effort';
    return 'Keep practising';
  }
  typeLabel(type: string): string {
    switch (type) {
      case 'multiple': return 'Select all that apply';
      case 'truefalse': return 'True or false';
      case 'short': return 'Short answer';
      default: return 'Single choice';
    }
  }
}
