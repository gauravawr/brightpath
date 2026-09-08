import { Routes } from '@angular/router';
import { langPrefixGuard } from './core/guards/lang-prefix.guard';
import { teacherGuard } from './core/guards/teacher.guard';
import { adminGuard } from './core/guards/admin.guard';

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
        loadComponent: () => import('./features/subjects/subjects-hub.component').then(m => m.SubjectsHubComponent),
        data: { title: '', metaDescription: 'Choose English or Maths, then browse BrightPath resources by year group.' },
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
      {
        path: 'subjects/:slug/year/:year',
        loadComponent: () => import('./features/subjects/year-group.component').then(m => m.YearGroupComponent),
        data: { title: 'Year group', metaDescription: 'Lessons and practice papers organised by year group on BrightPath.' },
      },

      // Lessons
      {
        path: 'lessons',
        loadComponent: () => import('./features/lessons/lessons-list.component').then(m => m.LessonsListComponent),
        data: { title: 'Lessons', metaDescription: 'Learn with clear, structured lessons from real teachers on BrightPath.' },
      },
      {
        path: 'lessons/year-1-maths-map',
        loadComponent: () => import('./features/curriculum/year1-maths-map.component').then(m => m.Year1MathsMapComponent),
        data: { title: 'Year 1 Maths Curriculum Map', metaDescription: 'A complete 30-week Year 1 Maths teaching map with five daily lesson focuses each week.' },
      },
      {
        path: 'lessons/year-1-maths/week-1/:slug',
        loadComponent: () => import('./features/curriculum/year1-week1-lesson.component').then(m => m.Year1Week1LessonComponent),
        data: { week: 1, title: 'Year 1 Maths lesson', metaDescription: 'A complete Year 1 Maths lesson with editable planning, pre-teach, slides and differentiated worksheets.' },
      },
      {
        path: 'lessons/year-1-maths/week-2/:slug',
        loadComponent: () => import('./features/curriculum/year1-week1-lesson.component').then(m => m.Year1Week1LessonComponent),
        data: { week: 2, title: 'Year 1 Maths lesson', metaDescription: 'A complete Year 1 Maths lesson with editable planning, pre-teach, slides and differentiated worksheets.' },
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

      // Admin area. Intentionally unlinked - no nav entry anywhere; you reach it by
      // typing /admin, and the guard asks the server whether you may stay.
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
        data: { title: 'Admin', metaDescription: 'Manage BrightPath access.', noIndex: true },
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
