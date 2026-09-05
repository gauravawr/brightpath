import { Injectable, inject, DOCUMENT } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CookieConsentService } from './cookie-consent.service';

type AnalyticsEvent = 'visit' | 'signup' | 'activated' | 'paid' | 'donate' | string;

declare global { interface Window { dataLayer?: unknown[]; } }

/** One facade over GTM/GA4. Respects cookie consent and skips localhost. */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private doc = inject(DOCUMENT);
  private consent = inject(CookieConsentService);
  private loaded = false;

  private get enabled(): boolean {
    return environment.enableAnalytics && !!environment.gtmContainerId && this.consent.granted();
  }

  /** Push a business event. Loads GTM lazily on first eligible event. */
  track(event: AnalyticsEvent, params: Record<string, unknown> = {}): void {
    if (!this.enabled) return;
    this.ensureGtm();
    const win = this.doc.defaultView as Window & { dataLayer?: unknown[] };
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push({ event: `bp_${event}`, ...params });
  }

  private ensureGtm(): void {
    if (this.loaded) return;
    this.loaded = true;
    const id = environment.gtmContainerId;
    const win = this.doc.defaultView as Window & { dataLayer?: unknown[] };
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const s = this.doc.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
    this.doc.head.appendChild(s);
  }
}
