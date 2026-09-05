import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AdminService } from '../services/admin.service';
import { LanguageService } from '../services/language.service';

/**
 * /admin is deliberately unlinked - there is no nav entry for it. Reaching it is
 * enough, provided the server says you are an admin.
 *
 * The check asks the server rather than reading the token, so an admin who was
 * granted the role a moment ago gets in immediately instead of waiting for their
 * token to refresh. Anyone else is bounced home, so the route reveals nothing.
 */
export const adminGuard: CanActivateFn = () => {
  const admin = inject(AdminService);
  const router = inject(Router);
  const lang = inject(LanguageService);
  const home = () => router.parseUrl(lang.localise('/'));

  const cached = admin.access();
  if (cached) return cached.isAdmin ? true : home();

  return admin.loadAccess().pipe(
    map(a => (a.isAdmin ? true : home())),
    catchError(() => of(home())),
  );
};
