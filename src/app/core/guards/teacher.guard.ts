import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LanguageService } from '../services/language.service';

/** Only signed-in teachers may reach the authoring area. */
export const teacherGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const lang = inject(LanguageService);
  if (auth.isTeacher()) return true;
  return router.parseUrl(lang.localise('/'));
};
