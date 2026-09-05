import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EntityCardComponent } from '../../shared/components/entity-card/entity-card.component';
import { ContentService } from '../../core/services/content.service';
import { LanguageService } from '../../core/services/language.service';
import { Subject } from '../../shared/models/content.models';

@Component({
  selector: 'bp-subjects-hub',
  standalone: true,
  imports: [TranslateModule, EntityCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-page-hero">
      <div class="bp-container">
        <span class="bp-chip">{{ 'nav.subjects' | translate }}</span>
        <h1>Explore subjects</h1>
        <p>Pick a subject to see its lessons and practice papers.</p>
      </div>
    </header>

    <section class="bp-section">
      <div class="bp-container">
        @if (loading()) {
          <div class="bp-loading"><span class="bp-spinner"></span> Loading subjects…</div>
        } @else if (subjects().length === 0) {
          <div class="bp-empty"><h3>No subjects yet</h3><p>Subjects will appear here once teachers add them.</p></div>
        } @else {
          <div class="bp-grid">
            @for (s of subjects(); track s.id) {
              <bp-entity-card
                [title]="s.name"
                [subtitle]="s.description"
                [icon]="s.iconEmoji"
                [tint]="s.colorHex ? s.colorHex + '22' : undefined"
                [metas]="[s.lessonCount + ' lessons', s.paperCount + ' papers']"
                [link]="l('/subjects/' + s.slug)" />
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class SubjectsHubComponent {
  private content = inject(ContentService);
  private lang = inject(LanguageService);
  readonly subjects = signal<Subject[]>([]);
  readonly loading = signal(true);

  constructor() {
    this.content.subjects().subscribe({
      next: v => { this.subjects.set(v); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  l(p: string): string { return this.lang.localise(p); }
}
