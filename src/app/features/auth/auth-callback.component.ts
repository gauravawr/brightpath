import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';

/** Handles the OIDC signin/signout redirect callbacks from eApp.AuthServer2. */
@Component({
  selector: 'bp-auth-callback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="bp-loading" style="min-height:60vh"><span class="bp-spinner"></span> {{ label }}</div>`,
})
export class AuthCallbackComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private lang = inject(LanguageService);
  protected label = 'Signing you in…';

  constructor() {
    const mode = this.route.snapshot.data['mode'] as 'in' | 'out';
    const done = () => this.router.navigateByUrl(this.lang.localise('/'));
    if (mode === 'out') { this.label = 'Signing out…'; done(); return; }
    this.auth.completeLogin().then(done).catch(done);
  }
}
