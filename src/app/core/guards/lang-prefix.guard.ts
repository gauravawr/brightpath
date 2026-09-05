import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { LanguageService } from '../services/language.service';

/**
 * canMatch guard: validates the /:lang/ URL prefix. If the first segment is a
 * supported language it matches (and syncs LanguageService); otherwise it
 * redirects to the resolved language, preserving the rest of the path.
 */
export const langPrefixGuard: CanMatchFn = (_route: Route, segments: UrlSegment[]) => {
  const lang = inject(LanguageService);
  const router = inject(Router);
  const first = segments[0]?.path;

  if (lang.isSupportedLang(first)) {
    lang.setCurrent(first);
    return true;
  }

  const target = lang.resolve(first);
  const rest = segments.map(s => s.path).join('/');
  return router.parseUrl(`/${target}${rest ? '/' + rest : ''}`);
};
