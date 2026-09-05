import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SiteHeaderComponent } from './shared/components/site-header/site-header.component';
import { SiteFooterComponent } from './shared/components/site-footer/site-footer.component';
import { CookieBannerComponent } from './shared/components/cookie-banner/cookie-banner.component';
import { SeoService } from './core/services/seo.service';
import { AuthService } from './core/services/auth.service';
import { SettingsService } from './core/services/settings.service';
import { AnalyticsService } from './core/services/analytics.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeaderComponent, SiteFooterComponent, CookieBannerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private router = inject(Router);
  private activated = inject(ActivatedRoute);
  private seo = inject(SeoService);
  private auth = inject(AuthService);
  private settings = inject(SettingsService);
  private analytics = inject(AnalyticsService);
  private lang = inject(LanguageService);

  ngOnInit(): void {
    void this.auth.init();
    this.settings.load();

    // Single SEO chokepoint — apply on NavigationEnd only (never in component constructors).
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      let r = this.activated;
      while (r.firstChild) r = r.firstChild;
      const data = r.snapshot.data;
      this.lang.setCurrent(this.lang.resolve(r.snapshot.paramMap.get('lang')));
      this.seo.apply({
        title: data['title'],
        description: data['metaDescription'],
        noIndex: data['noIndex'] === true,
      });
      this.analytics.track('visit', { path: this.router.url });
    });
  }
}
