import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'bp-site-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent {
  private auth = inject(AuthService);
  lang = inject(LanguageService);
  readonly user = this.auth.user;
  readonly isTeacher = this.auth.isTeacher;
  readonly menuOpen = signal(false);

  l(path: string): string { return this.lang.localise(path); }
  toggle(): void { this.menuOpen.update(v => !v); }
  close(): void { this.menuOpen.set(false); }
  login(): void { this.auth.login(); }
  logout(): void { this.auth.logout(); }
}
