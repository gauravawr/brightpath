import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { imageUrl } from '../../image-url';

/** Reusable card for a lesson / paper / subject in a grid. */
@Component({
  selector: 'bp-entity-card',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="bp-card bp-ecard bp-reveal" [routerLink]="link()">
      <div class="bp-ecard__thumb" [style.background]="tint()">
        @if (image()) { <img [src]="img()" [alt]="title()" loading="lazy" /> }
        @else { <span>{{ icon() || '📘' }}</span> }
      </div>
      <div class="bp-ecard__body">
        @if (eyebrow()) { <span class="bp-label">{{ eyebrow() }}</span> }
        <h3 class="bp-ecard__title">{{ title() }}</h3>
        @if (subtitle()) { <p class="bp-ecard__sub">{{ subtitle() }}</p> }
        @if (metas().length) {
          <div class="bp-ecard__meta">
            @for (m of metas(); track m) { <span class="bp-meta-chip">{{ m }}</span> }
          </div>
        }
      </div>
    </a>
  `,
})
export class EntityCardComponent {
  title = input.required<string>();
  link = input.required<string | any[]>();
  subtitle = input<string | undefined>();
  eyebrow = input<string | undefined>();
  image = input<string | undefined | null>();
  icon = input<string | undefined | null>();
  metas = input<string[]>([]);
  tint = input<string | undefined>();

  img(): string { return imageUrl(this.image(), 'card'); }
}
