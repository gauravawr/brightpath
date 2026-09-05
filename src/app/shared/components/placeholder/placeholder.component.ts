import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LanguageService } from '../../../core/services/language.service';

/** Temporary page for routes whose feature UI is built in later phases. */
@Component({
  selector: 'bp-placeholder',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="ph bp-container">
      <span class="bp-chip">Coming soon</span>
      <h1>{{ title() }}</h1>
      <p>This part of BrightPath is being built. It'll appear here shortly.</p>
      <a class="bp-btn" [routerLink]="home()">← Back to home</a>
    </section>
  `,
  styles: [`
    .ph { min-height: 52vh; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 1rem; padding-block: 64px; }
    .ph h1 { font-size: clamp(2rem, 5vw, 3rem); }
    .ph p { color: var(--text-muted); max-width: 46ch; }
    .ph .bp-btn { margin-top: .5rem; }
  `],
})
export class PlaceholderComponent {
  private route = inject(ActivatedRoute);
  private lang = inject(LanguageService);
  readonly title = toSignal(this.route.data.pipe(map(d => (d['title'] as string) || 'BrightPath')), { initialValue: 'BrightPath' });
  home(): string { return this.lang.localise('/'); }
}
