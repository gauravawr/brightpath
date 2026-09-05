import { Injectable, signal } from '@angular/core';

const SUPPORTED = ['en', 'hi'] as const;
export type SupportedLang = typeof SUPPORTED[number];
const DEFAULT_LANG: SupportedLang = 'en';
const STORAGE_KEY = 'bp_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly supported = SUPPORTED;
  readonly current = signal<SupportedLang>(DEFAULT_LANG);

  isSupportedLang(lang: string | null | undefined): lang is SupportedLang {
    return !!lang && (SUPPORTED as readonly string[]).includes(lang);
  }

  /** Resolve the lang to use (URL > stored > default). */
  resolve(urlLang?: string | null): SupportedLang {
    if (this.isSupportedLang(urlLang)) return urlLang;
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return this.isSupportedLang(stored) ? stored : DEFAULT_LANG;
  }

  setCurrent(lang: SupportedLang): void {
    this.current.set(lang);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lang);
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }

  /** Build a language-prefixed URL, e.g. localise('/subjects') -> '/en/subjects'. */
  localise(path: string, lang = this.current()): string {
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `/${lang}${clean === '/' ? '' : clean}`;
  }
}
