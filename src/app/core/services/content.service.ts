import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Subject, LessonSummary, Lesson, TestPaperSummary, TestPaper,
  AttemptSubmission, AttemptResult, QuestionType,
} from '../../shared/models/content.models';

/** Client for the BrightPath API controllers (BrightPath_ tables in the shared eApp DB). */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);
  private api = environment.apiBaseUrl;

  // Subjects
  subjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.api}/api/BrightPathSubjects`);
  }
  subject(slug: string): Observable<Subject> {
    return this.http.get<Subject>(`${this.api}/api/BrightPathSubjects/${slug}`);
  }

  // Lessons
  lessons(subjectSlug?: string): Observable<LessonSummary[]> {
    const q = subjectSlug ? `?subject=${encodeURIComponent(subjectSlug)}` : '';
    return this.http.get<LessonSummary[]>(`${this.api}/api/BrightPathLessons${q}`);
  }
  lesson(slug: string): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.api}/api/BrightPathLessons/${slug}`);
  }

  // Test papers
  papers(subjectSlug?: string): Observable<TestPaperSummary[]> {
    const q = subjectSlug ? `?subject=${encodeURIComponent(subjectSlug)}` : '';
    return this.http.get<TestPaperSummary[]>(`${this.api}/api/BrightPathTestPapers${q}`);
  }
  paper(slug: string): Observable<TestPaper> {
    return this.http.get<TestPaper>(`${this.api}/api/BrightPathTestPapers/${slug}`);
  }

  // Attempts (auth required; result scored server-side)
  submitAttempt(sub: AttemptSubmission): Observable<AttemptResult> {
    return this.http.post<AttemptResult>(`${this.api}/api/BrightPathAttempts`, sub);
  }

  // ── Authoring (teacher only; enforced server-side) ──────────────────────────
  createSubject(input: SubjectInput): Observable<Subject> {
    return this.http.post<Subject>(`${this.api}/api/BrightPathSubjects`, input);
  }
  createLesson(input: LessonInput): Observable<LessonSummary> {
    return this.http.post<LessonSummary>(`${this.api}/api/BrightPathLessons`, input);
  }
  createPaper(input: TestPaperInput): Observable<TestPaperSummary> {
    return this.http.post<TestPaperSummary>(`${this.api}/api/BrightPathTestPapers`, input);
  }

  // ── File uploads (teacher only) ─────────────────────────────────────────────
  /** Upload a standalone file (e.g. a cover image chosen before the lesson exists). */
  upload(file: File): Observable<UploadedFile> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<UploadedFile>(`${this.api}/api/BrightPathUploads`, form);
  }

  /** Upload and attach to an existing lesson in one round trip. */
  uploadToLesson(lessonId: number, file: File): Observable<Attachment> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<Attachment>(`${this.api}/api/BrightPathUploads/lesson/${lessonId}`, form);
  }

  deleteAttachment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/api/BrightPathUploads/attachment/${id}`);
  }
}

/** Mirrors BrightPathUploadService.MaxBytes on the server. */
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
export const ACCEPTED_UPLOADS = '.pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.svg';

export interface UploadedFile {
  blobName: string; url: string; fileName: string;
  contentType: string; sizeBytes: number; kind: string;
}
export interface Attachment {
  id: number; fileName: string; url: string;
  contentType: string; sizeBytes: number; kind: string;
}

export interface SubjectInput {
  name: string; slug?: string; description?: string; colorHex?: string; iconEmoji?: string; sort?: number; isActive?: boolean;
}
export interface LessonInput {
  subjectId: number; title: string; slug?: string; summary?: string; bodyHtml?: string;
  coverImageName?: string; videoUrl?: string; durationMinutes?: number; level?: string; isPublished: boolean;
}
export interface QuestionOptionInput { text: string; isCorrect: boolean; order?: number; }
export interface QuestionInput {
  order?: number; type: QuestionType; prompt: string; imageName?: string; marks: number; expectedAnswer?: string; options?: QuestionOptionInput[];
}
export interface TestPaperInput {
  subjectId: number; title: string; slug?: string; summary?: string; instructions?: string;
  durationMinutes?: number; level?: string; isPublished: boolean; questions: QuestionInput[];
}
