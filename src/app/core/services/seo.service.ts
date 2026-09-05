import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LanguageService } from './language.service';

export interface SeoData {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  canonicalPath?: string; // path without origin, e.g. /en/subjects/maths
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = 'BrightPath';
const DEFAULT_DESC = 'Lessons and practice test papers from real teachers. Learn at your own pace on BrightPath.';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private lang = inject(LanguageService);

  /** The single SEO chokepoint. Call once per NavigationEnd from the shell. */
  apply(data: SeoData): void {
    const fullTitle = data.title ? `${data.title} · ${SITE_NAME}` : `${SITE_NAME} — Learn with lessons & practice tests`;
    const desc = data.description ?? DEFAULT_DESC;

    this.title.setTitle(fullTitle);
    this.setName('description', desc);
    this.setRobots(data.noIndex);

    // Open Graph
    this.setProp('og:title', fullTitle);
    this.setProp('og:description', desc);
    this.setProp('og:type', 'website');
    this.setProp('og:site_name', SITE_NAME);
    this.setProp('og:locale', this.lang.current());
    if (data.image) this.setProp('og:image', data.image);

    // Twitter
    this.setName('twitter:card', data.image ? 'summary_large_image' : 'summary');
    this.setName('twitter:title', fullTitle);
    this.setName('twitter:description', desc);
    if (data.image) this.setName('twitter:image', data.image);

    this.setCanonical(data.canonicalPath);
    this.setJsonLd(data.jsonLd);
  }

  setNoIndex(on = true): void { this.setRobots(on); }

  private setRobots(noIndex?: boolean): void {
    this.setName('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }
  private setProp(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setCanonical(path?: string): void {
    const origin = this.doc.location?.origin ?? '';
    const href = origin + (path ?? this.doc.location?.pathname ?? '/');
    let link = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setJsonLd(data?: Record<string, unknown>): void {
    const id = 'bp-jsonld';
    const existing = this.doc.getElementById(id);
    if (existing) existing.remove();
    if (!data) return;
    const script = this.doc.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }
}
