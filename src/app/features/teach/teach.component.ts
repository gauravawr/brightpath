import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService, QuestionInput, TestPaperInput } from '../../core/services/content.service';
import { AuthService } from '../../core/services/auth.service';
import { Subject, QuestionType } from '../../shared/models/content.models';

type Tab = 'subject' | 'lesson' | 'paper';

@Component({
  selector: 'bp-teach',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './teach.component.html',
  styleUrl: './teach.component.scss',
})
export class TeachComponent {
  private content = inject(ContentService);
  private auth = inject(AuthService);

  readonly tab = signal<Tab>('subject');
  readonly subjects = signal<Subject[]>([]);
  readonly saving = signal(false);
  readonly toast = signal<string | null>(null);
  readonly toastErr = signal(false);
  readonly teacherName = computed(() => this.auth.user()?.name ?? 'Teacher');

  // subject form
  subj = { name: '', description: '', colorHex: '#4f46e5', iconEmoji: '📘' };
  // lesson form
  lesson = { subjectId: 0, title: '', summary: '', bodyHtml: '', coverImageName: '', videoUrl: '', durationMinutes: null as number | null, level: 'beginner', isPublished: true };
  // paper form
  paper = { subjectId: 0, title: '', summary: '', instructions: '', durationMinutes: null as number | null, level: 'beginner', isPublished: true };
  questions = signal<QuestionInput[]>([this.newQuestion()]);

  readonly levels = ['beginner', 'intermediate', 'advanced'];
  readonly types: { v: QuestionType; label: string }[] = [
    { v: 'single', label: 'Single choice' },
    { v: 'multiple', label: 'Multiple choice' },
    { v: 'truefalse', label: 'True / false' },
    { v: 'short', label: 'Short answer' },
  ];

  constructor() { this.reloadSubjects(); }

  private reloadSubjects(): void {
    this.content.subjects().subscribe({ next: v => this.subjects.set(v), error: () => {} });
  }

  newQuestion(): QuestionInput {
    return { type: 'single', prompt: '', marks: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] };
  }

  // ---- paper question builder ----
  addQuestion(): void { this.questions.set([...this.questions(), this.newQuestion()]); }
  removeQuestion(i: number): void { this.questions.set(this.questions().filter((_, x) => x !== i)); }
  addOption(qi: number): void {
    const qs = [...this.questions()]; qs[qi] = { ...qs[qi], options: [...(qs[qi].options ?? []), { text: '', isCorrect: false }] };
    this.questions.set(qs);
  }
  removeOption(qi: number, oi: number): void {
    const qs = [...this.questions()]; qs[qi] = { ...qs[qi], options: (qs[qi].options ?? []).filter((_, x) => x !== oi) };
    this.questions.set(qs);
  }
  onTypeChange(qi: number): void {
    const qs = [...this.questions()]; const q = qs[qi];
    if (q.type === 'truefalse') q.options = [{ text: 'True', isCorrect: true }, { text: 'False', isCorrect: false }];
    else if (q.type === 'short') q.options = [];
    else if (!q.options || q.options.length < 2) q.options = [{ text: '', isCorrect: true }, { text: '', isCorrect: false }];
    this.questions.set(qs);
  }
  markCorrect(qi: number, oi: number): void {
    const qs = [...this.questions()]; const q = qs[qi];
    const opts = (q.options ?? []).map((o, x) => q.type === 'multiple'
      ? (x === oi ? { ...o, isCorrect: !o.isCorrect } : o)
      : { ...o, isCorrect: x === oi });
    qs[qi] = { ...q, options: opts };
    this.questions.set(qs);
  }

  private flash(msg: string, err = false): void {
    this.toast.set(msg); this.toastErr.set(err);
    setTimeout(() => this.toast.set(null), 4000);
  }

  saveSubject(): void {
    if (!this.subj.name.trim()) return;
    this.saving.set(true);
    this.content.createSubject(this.subj).subscribe({
      next: () => { this.flash('Subject created ✓'); this.subj = { name: '', description: '', colorHex: '#4f46e5', iconEmoji: '📘' }; this.reloadSubjects(); this.saving.set(false); },
      error: () => { this.flash('Could not save subject (are you signed in as a teacher, and is the API running?)', true); this.saving.set(false); },
    });
  }

  saveLesson(): void {
    if (!this.lesson.title.trim() || !this.lesson.subjectId) { this.flash('Pick a subject and add a title.', true); return; }
    this.saving.set(true);
    this.content.createLesson({ ...this.lesson, durationMinutes: this.lesson.durationMinutes ?? undefined }).subscribe({
      next: () => { this.flash('Lesson created ✓'); this.saving.set(false); },
      error: () => { this.flash('Could not save lesson.', true); this.saving.set(false); },
    });
  }

  savePaper(): void {
    if (!this.paper.title.trim() || !this.paper.subjectId) { this.flash('Pick a subject and add a title.', true); return; }
    const qs = this.questions().filter(q => q.prompt.trim());
    if (qs.length === 0) { this.flash('Add at least one question.', true); return; }
    const input: TestPaperInput = {
      ...this.paper, durationMinutes: this.paper.durationMinutes ?? undefined,
      questions: qs.map((q, i) => ({ ...q, order: i })),
    };
    this.saving.set(true);
    this.content.createPaper(input).subscribe({
      next: () => { this.flash('Practice paper created ✓'); this.questions.set([this.newQuestion()]); this.saving.set(false); },
      error: () => { this.flash('Could not save paper.', true); this.saving.set(false); },
    });
  }
}
