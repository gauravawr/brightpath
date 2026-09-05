import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/** Attaches the bearer token to BrightPath API calls only. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApi = req.url.startsWith(environment.apiBaseUrl);
  if (!isApi) return next(req);

  const auth = inject(AuthService);
  return from(auth.accessToken()).pipe(
    switchMap(token => {
      const authed = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(authed);
    }),
  );
};
