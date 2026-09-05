import { Routes } from '@angular/router';
import { langPrefixGuard } from './core/guards/lang-prefix.guard';
import { teacherGuard } from './core/guards/teacher.guard';

const placeholder = (title: string, metaDescription: string, noIndex = false) => ({
  loadComponent: () => import('./shared/components/placeholder/placeholder.component').then(m => m.PlaceholderComponent),
  data: { title, metaDescription, noIndex },
});

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'en' },

  {
    path: ':lang',
    canMatch: [langPrefixGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        data: { title: '', metaDescription: 'Lessons and practice test papers from real teachers. Learn at your own pace on BrightPath.' },
      },

      // Subjects
      {
        path: 'subjects',
        loadComponent: () => import('./features/subjects/subjects-hub.component').then(m => m.SubjectsHubComponent),
        data: { title: 'Subjects', metaDescription: 'Browse every subject on BrightPath — lessons and practice papers grouped by topic.' },
      },
      {
        path: 'subjects/:slug',
        loadComponent: () => import('./features/subjects/subject-detail.component').then(m => m.SubjectDetailComponent),
        data: { title: 'Subject', metaDescription: 'Lessons and practice papers for this subject on BrightPath.' },
      },

      // Lessons
      {
        path: 'lessons',
        loadComponent: () => import('./features/lessons/lessons-list.component').then(m => m.LessonsListComponent),
        data: { title: 'Lessons', metaDescription: 'Learn with clear, structured lessons from real teachers on BrightPath.' },
      },
      {
        path: 'lessons/:slug',
        loadComponent: () => import('./features/lessons/lesson-detail.component').then(m => m.LessonDetailComponent),
        data: { title: 'Lesson', metaDescription: 'A BrightPath lesson.' },
      },

      // Practice test papers
      {
        path: 'practice',
        loadComponent: () => import('./features/practice/practice-list.component').then(m => m.PracticeListComponent),
        data: { title: 'Practice Papers', metaDescription: 'Test yourself with practice papers and instant scoring on BrightPath.' },
      },
      {
        path: 'practice/:slug',
        loadComponent: () => import('./features/practice/test-runner.component').then(m => m.TestRunnerComponent),
        data: { title: 'Practice Paper', metaDescription: 'Take a BrightPath practice paper.' },
      },

      // Support / donation
      {
        path: 'support',
        loadComponent: () => import('./features/support/support.component').then(m => m.SupportComponent),
        data: { title: 'Support BrightPath', metaDescription: 'BrightPath is free. If it helps you, you can support it with an optional donation.' },
      },

      // Teacher authoring area
      {
        path: 'teach',
        canActivate: [teacherGuard],
        loadComponent: () => import('./features/teach/teach.component').then(m => m.TeachComponent),
        data: { title: 'Teach', metaDescription: 'Create and manage your lessons and practice papers.', noIndex: true },
      },

      // Legal
      { path: 'privacy', ...placeholder('Privacy Policy', 'How BrightPath handles your data.') },
      { path: 'terms', ...placeholder('Terms of Use', 'BrightPath terms of use.') },

      // Auth callbacks
      {
        path: 'signin-callback',
        loadComponent: () => import('./features/auth/auth-callback.component').then(m => m.AuthCallbackComponent),
        data: { title: 'Signing in…', metaDescription: 'Completing sign in.', noIndex: true, mode: 'in' },
      },
      {
        path: 'signout-callback',
        loadComponent: () => import('./features/auth/auth-callback.component').then(m => m.AuthCallbackComponent),
        data: { title: 'Signing out…', metaDescription: 'Completing sign out.', noIndex: true, mode: 'out' },
      },

      // Not found
      { path: 'not-found', ...placeholder('Not found', 'Page not found.', true) },
      { path: '**', redirectTo: 'not-found' },
    ],
  },

  // Foreign / unsupported first segment → default to English
  { path: '**', redirectTo: 'en' },
];
