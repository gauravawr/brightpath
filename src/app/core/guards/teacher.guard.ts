import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, from, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AdminService } from '../services/admin.service';
import { LanguageService } from '../services/language.service';

/**
 * Only signed-in teachers may reach the authoring area.
 *
 * The token is what matters here, because the API authorises writes from the token's
 * role claims - letting someone in on a database check alone would hand them a page
 * where every save 403s. So when the token disagrees with the server we refresh the
 * token rather than override it: someone granted the teacher role a minute ago gets in
 * on the next navigation, instead of waiting for their session to expire.
 */
export const teacherGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const admin = inject(AdminService);
  const router = inject(Router);
  const lang = inject(LanguageService);
  const home = () => router.parseUrl(lang.localise('/'));

  if (auth.isTeacher()) return true;
  if (!auth.isAuthenticated()) return home();

  // Signed in but no teacher role in the token - ask the server whether it is stale.
  return admin.loadAccess().pipe(
    switchMap(access => {
      if (!access.isTeacher) return of(home());
      return from(auth.refreshSession()).pipe(
        switchMap(ok => of(ok && auth.isTeacher() ? true : home())),
      );
    }),
    catchError(() => of(home())),
  );
};
