import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

interface Feature { icon: string; accent: string; titleKey: string; bodyKey: string; }
interface Step { n: string; titleKey: string; bodyKey: string; }

@Component({
  selector: 'bp-home',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private lang = inject(LanguageService);
  l(path: string): string { return this.lang.localise(path); }

  readonly features: Feature[] = [
    { icon: '📚', accent: 'brand',   titleKey: 'home.f1.title', bodyKey: 'home.f1.body' },
    { icon: '📝', accent: 'amber',   titleKey: 'home.f2.title', bodyKey: 'home.f2.body' },
    { icon: '⚡', accent: 'emerald', titleKey: 'home.f3.title', bodyKey: 'home.f3.body' },
    { icon: '🎯', accent: 'sky',     titleKey: 'home.f4.title', bodyKey: 'home.f4.body' },
  ];

  readonly steps: Step[] = [
    { n: '1', titleKey: 'home.s1.title', bodyKey: 'home.s1.body' },
    { n: '2', titleKey: 'home.s2.title', bodyKey: 'home.s2.body' },
    { n: '3', titleKey: 'home.s3.title', bodyKey: 'home.s3.body' },
  ];
}
