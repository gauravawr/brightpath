import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'bp-subject-detail',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-page-hero subject-hero" [class.subject-hero--maths]="isMaths">
      <div class="bp-container">
        <a class="back" [routerLink]="l('/subjects')">← All subjects</a>
        <span class="bp-chip">{{ isMaths ? '➗ Maths' : '📖 English' }}</span>
        <h1>{{ displayName }} year groups</h1>
        <p>Choose a year group to open its teaching structure, lessons and resources.</p>
      </div>
    </header>

    <main class="bp-section">
      <div class="bp-container">
        <div class="folder-heading">
          <div>
            <span class="bp-label">Year-group folders</span>
            <h2>Year 1 to Year 6</h2>
          </div>
          @if (isMaths) { <p>Open Year 1 to see the complete 30-week Maths structure.</p> }
        </div>

        <div class="year-grid" [attr.aria-label]="displayName + ' year groups'">
          @for (year of years; track year; let index = $index) {
            <a
              class="year-tile bp-card bp-reveal"
              [class.year-tile--featured]="isMaths && year === 1"
              [style.animation-delay.ms]="index * 45"
              [routerLink]="yearLink(year)"
              [attr.aria-label]="'Open ' + displayName + ' Year ' + year">
              <span class="year-tile__symbols" aria-hidden="true">
                <i>{{ symbols[index][0] }}</i><i>{{ symbols[index][1] }}</i><i>{{ symbols[index][2] }}</i>
              </span>
              <span class="year-tile__subject">{{ displayName }}</span>
              <strong>Y{{ year }}</strong>
              <span class="year-tile__name">Year {{ year }}</span>
              <span class="year-tile__status">
                {{ isMaths && year === 1 ? '30-week whole-year map' : 'Open year folder' }}
                <b aria-hidden="true">→</b>
              </span>
            </a>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host{display:block}.subject-hero{position:relative;overflow:hidden}.subject-hero::after{content:'Aa';position:absolute;right:max(2vw,1rem);bottom:-2.8rem;color:var(--accent-sky);opacity:.055;font:800 clamp(8rem,20vw,16rem) var(--font-head);pointer-events:none}.subject-hero--maths::after{content:'÷';color:var(--brand-d)}.subject-hero .bp-container{position:relative;z-index:1}.back{display:block;width:max-content;margin-bottom:1.35rem;color:var(--text-muted);font-size:.9rem;font-weight:750}.folder-heading{display:flex;align-items:end;justify-content:space-between;gap:1.25rem;margin-bottom:1.5rem}.folder-heading h2{margin:.35rem 0 0}.folder-heading p{max-width:39ch;margin:0;color:var(--text-muted);text-align:right}.year-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.25rem}.year-tile{--tile-accent:var(--accent-sky);position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:255px;padding:1.35rem;overflow:hidden;color:var(--text);text-align:center;border-top:7px solid var(--tile-accent);isolation:isolate}.subject-hero--maths + .bp-section .year-tile{--tile-accent:var(--brand-m)}.year-tile:nth-child(2),.subject-hero--maths + .bp-section .year-tile:nth-child(2){--tile-accent:var(--accent-amber)}.year-tile:nth-child(3),.subject-hero--maths + .bp-section .year-tile:nth-child(3){--tile-accent:var(--accent-emerald)}.year-tile:nth-child(4),.subject-hero--maths + .bp-section .year-tile:nth-child(4){--tile-accent:var(--accent-sky)}.year-tile:nth-child(5),.subject-hero--maths + .bp-section .year-tile:nth-child(5){--tile-accent:var(--accent-rose)}.year-tile:nth-child(6),.subject-hero--maths + .bp-section .year-tile:nth-child(6){--tile-accent:var(--slate-700)}.year-tile:hover{color:var(--text)}.year-tile--featured{box-shadow:0 12px 34px color-mix(in srgb,var(--brand-d) 18%,transparent)}.year-tile--featured::after{content:'30 WEEKS';position:absolute;top:.7rem;right:.7rem;border-radius:var(--r-pill);padding:.28rem .58rem;background:var(--brand-tint);color:var(--brand-d);font-size:.65rem;font-weight:850;letter-spacing:.06em}.year-tile__symbols{position:absolute;inset:0;z-index:-1;color:var(--tile-accent);opacity:.11;font:800 2.25rem var(--font-head);pointer-events:none}.year-tile__symbols i{position:absolute;font-style:normal}.year-tile__symbols i:nth-child(1){top:1rem;left:1.15rem}.year-tile__symbols i:nth-child(2){top:1.5rem;right:1.3rem}.year-tile__symbols i:nth-child(3){bottom:3rem;right:1.25rem}.year-tile__subject{color:var(--tile-accent);font-size:.7rem;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.year-tile strong{display:block;margin:.3rem 0 0;color:var(--slate-900);font:800 clamp(3.2rem,7vw,4.8rem)/1 var(--font-head)}.year-tile__name{margin-top:.35rem;color:var(--slate-600);font-weight:750}.year-tile__status{position:absolute;right:1rem;bottom:.85rem;left:1rem;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border);padding-top:.7rem;color:var(--tile-accent);font-size:.75rem;font-weight:800}.year-tile__status b{font-size:1.1rem}@media(max-width:820px){.year-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.folder-heading{display:block}.folder-heading p{margin-top:.55rem;text-align:left}.year-grid{grid-template-columns:1fr}.year-tile{min-height:230px}}@media(prefers-reduced-motion:reduce){.year-tile{animation:none}}
  `],
})
export class SubjectDetailComponent {
  private route = inject(ActivatedRoute);
  private lang = inject(LanguageService);

  readonly subjectSlug = (this.route.snapshot.paramMap.get('slug') ?? '').toLowerCase();
  readonly isMaths = this.subjectSlug === 'maths';
  readonly displayName = this.isMaths ? 'Maths' : this.subjectSlug === 'english' ? 'English' : this.subjectSlug;
  readonly years = [1, 2, 3, 4, 5, 6];
  readonly mathsSymbols = [['+', '='], ['−', '<'], ['×', '>'], ['÷', '+'], ['=', '−'], ['%', '×']];
  readonly englishSymbols = [['Aa', '.'], ['?', '!'], ['“', '”'], ['abc', ','], ['A–Z', ':'], ['✎', ';']];
  readonly symbols = this.years.map((_, index) => {
    const pair = (this.isMaths ? this.mathsSymbols : this.englishSymbols)[index];
    return [pair[0], pair[1], this.isMaths ? String(index + 1) : 'Aa'];
  });

  yearLink(year: number): string {
    return this.isMaths && year === 1
      ? this.l('/lessons/year-1-maths-map')
      : this.l(`/subjects/${this.subjectSlug}/year/${year}`);
  }

  l(path: string): string { return this.lang.localise(path); }
}
