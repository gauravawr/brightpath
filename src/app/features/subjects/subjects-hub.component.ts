import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

interface SubjectFolder {
  name: string;
  slug: 'english' | 'maths';
  description: string;
  icon: string;
  motif: string[];
}

@Component({
  selector: 'bp-subjects-hub',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-page-hero subjects-hero">
      <div class="bp-container">
        <span class="bp-chip">Subjects</span>
        <h1>Choose a subject</h1>
        <p>Open English or Maths, then choose the year group you want to teach.</p>
      </div>
    </header>

    <main class="bp-section">
      <div class="bp-container">
        <div class="subject-grid" aria-label="Available subjects">
          @for (subject of subjects; track subject.slug; let index = $index) {
            <a
              class="subject-folder bp-card bp-reveal"
              [class.subject-folder--maths]="subject.slug === 'maths'"
              [style.animation-delay.ms]="index * 70"
              [routerLink]="l('/subjects/' + subject.slug)"
              [attr.aria-label]="'Open ' + subject.name">
              <span class="subject-folder__tab" aria-hidden="true"></span>
              <span class="subject-folder__motif" aria-hidden="true">
                @for (symbol of subject.motif; track symbol) { <i>{{ symbol }}</i> }
              </span>
              <span class="subject-folder__icon" aria-hidden="true">{{ subject.icon }}</span>
              <span class="subject-folder__content">
                <small>Subject</small>
                <strong>{{ subject.name }}</strong>
                <span>{{ subject.description }}</span>
              </span>
              <span class="subject-folder__action">Choose {{ subject.name }} <b aria-hidden="true">→</b></span>
            </a>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host{display:block}.subjects-hero{text-align:center}.subjects-hero p{margin-inline:auto}.subject-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1.25rem,3vw,2rem);max-width:940px;margin-inline:auto}.subject-folder{--folder-accent:var(--accent-sky);position:relative;display:grid;grid-template-columns:auto 1fr;gap:1.25rem;min-height:300px;padding:clamp(1.5rem,4vw,2.25rem);overflow:hidden;color:var(--text);border-top:8px solid var(--folder-accent);isolation:isolate}.subject-folder--maths{--folder-accent:var(--brand-m)}.subject-folder:hover{color:var(--text)}.subject-folder__tab{position:absolute;top:-1px;left:2rem;width:118px;height:18px;border-radius:0 0 12px 12px;background:var(--folder-accent)}.subject-folder__motif{position:absolute;inset:0;z-index:-1;color:var(--folder-accent);opacity:.09;font:800 clamp(2.2rem,6vw,4.2rem) var(--font-head);pointer-events:none}.subject-folder__motif i{position:absolute;font-style:normal}.subject-folder__motif i:nth-child(1){top:15%;right:10%}.subject-folder__motif i:nth-child(2){top:42%;right:28%;transform:rotate(-12deg)}.subject-folder__motif i:nth-child(3){bottom:8%;right:8%;transform:rotate(10deg)}.subject-folder__icon{display:grid;place-items:center;align-self:start;width:68px;height:68px;margin-top:1.6rem;border-radius:20px;background:color-mix(in srgb,var(--folder-accent) 12%,var(--white));font-size:2rem}.subject-folder__content{align-self:center;display:block;min-width:0}.subject-folder__content small{display:block;color:var(--folder-accent);font-size:.75rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.subject-folder__content strong{display:block;margin:.25rem 0 .65rem;color:var(--slate-900);font:800 clamp(1.8rem,4vw,2.6rem) var(--font-head)}.subject-folder__content span{display:block;max-width:30ch;color:var(--text-muted)}.subject-folder__action{grid-column:1/-1;align-self:end;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border);padding-top:1rem;color:var(--folder-accent);font-weight:800}.subject-folder__action b{font-size:1.3rem}@media(max-width:700px){.subject-grid{grid-template-columns:1fr}.subject-folder{min-height:250px}}@media(max-width:420px){.subject-folder{grid-template-columns:1fr;gap:.8rem}.subject-folder__icon{width:58px;height:58px}.subject-folder__content strong{font-size:1.8rem}}
  `],
})
export class SubjectsHubComponent {
  private lang = inject(LanguageService);

  readonly subjects: SubjectFolder[] = [
    {
      name: 'English',
      slug: 'english',
      description: 'Reading, writing and grammar resources from Year 1 to Year 6.',
      icon: '📖',
      motif: ['Aa', '?', '“ ”'],
    },
    {
      name: 'Maths',
      slug: 'maths',
      description: 'Carefully sequenced Maths teaching from Year 1 to Year 6.',
      icon: '➗',
      motif: ['+', '×', '='],
    },
  ];

  l(path: string): string { return this.lang.localise(path); }
}
