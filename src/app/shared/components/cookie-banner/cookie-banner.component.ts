import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CookieConsentService } from '../../../core/services/cookie-consent.service';

@Component({
  selector: 'bp-cookie-banner',
  standalone: true,
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!consent.decided()) {
      <div class="cb bp-reveal" role="dialog" aria-label="Cookie consent">
        <p>{{ 'cookie.text' | translate }}</p>
        <div class="cb__actions">
          <button class="bp-btn bp-btn--ghost" (click)="consent.reject()">{{ 'cookie.decline' | translate }}</button>
          <button class="bp-btn" (click)="consent.accept()">{{ 'cookie.accept' | translate }}</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .cb {
      position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 60;
      max-width: 720px; margin-inline: auto;
      display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
      background: var(--white); border: 1px solid var(--border);
      border-radius: var(--r-md); box-shadow: var(--shadow-hero); padding: 16px 18px;
    }
    .cb p { margin: 0; flex: 1 1 260px; font-size: .88rem; color: var(--slate-600); }
    .cb__actions { display: flex; gap: .6rem; }
    @media (max-width: 480px) { .cb__actions { flex: 1; } .cb__actions .bp-btn, .cb__actions .bp-btn--ghost { flex: 1; justify-content: center; } }
  `],
})
export class CookieBannerComponent {
  consent = inject(CookieConsentService);
}
