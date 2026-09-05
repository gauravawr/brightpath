// TypeScript interfaces mirroring the BrightPath API DTOs.
// Backend tables are prefixed BrightPath_ (e.g. BrightPath_Lessons).

export interface Subject {
  id: number;
  slug: string;
  name: string;
  description?: string;
  colorHex?: string;
  iconEmoji?: string;
  lessonCount: number;
  paperCount: number;
}

export interface TeacherRef {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface LessonSummary {
  id: number;
  slug: string;
  subjectSlug: string;
  title: string;
  summary?: string;
  coverImageUrl?: string;
  durationMinutes?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  teacher: TeacherRef;
  publishedUtc?: string;
}

export interface Lesson extends LessonSummary {
  bodyHtml: string;
  videoUrl?: string;
  /** Downloadable files (worksheets, slide decks) — shape matches AttachmentDto on the API. */
  attachments?: LessonAttachment[];
  relatedPaperSlugs?: string[];
}

export interface LessonAttachment {
  id: number;
  fileName: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  /** document | slides | image */
  kind: string;
}

export interface TestPaperSummary {
  id: number;
  slug: string;
  subjectSlug: string;
  title: string;
  summary?: string;
  questionCount: number;
  durationMinutes?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  teacher: TeacherRef;
  publishedUtc?: string;
}

export type QuestionType = 'single' | 'multiple' | 'truefalse' | 'short';

export interface QuestionOption {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  order: number;
  type: QuestionType;
  prompt: string;
  imageUrl?: string;
  marks: number;
  options?: QuestionOption[]; // for single/multiple/truefalse
}

export interface TestPaper extends TestPaperSummary {
  instructions?: string;
  questions: Question[];
}

export interface AttemptAnswer {
  questionId: number;
  selectedOptionIds?: number[];
  textAnswer?: string;
}

export interface AttemptSubmission {
  paperSlug: string;
  answers: AttemptAnswer[];
  elapsedSeconds: number;
}

export interface AttemptResult {
  attemptId: number;
  paperSlug: string;
  scoredMarks: number;
  totalMarks: number;
  percentage: number;
  correctCount: number;
  questionCount: number;
  breakdown: { questionId: number; correct: boolean; awardedMarks: number; correctOptionIds?: number[] }[];
}
