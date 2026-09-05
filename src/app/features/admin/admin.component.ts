import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService, Member, ROLE_ADMIN, ROLE_TEACHER } from '../../core/services/admin.service';

@Component({
  selector: 'bp-admin',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bp-page-hero">
      <div class="bp-container">
        <span class="bp-chip">🔑 Admin</span>
        <h1>People &amp; access</h1>
        <p>Grant teacher access so someone can publish lessons, or admin access so they can manage people too.</p>
      </div>
    </header>

    <section class="bp-section"><div class="bp-container adm">
      @if (toast()) { <div class="toast" [class.toast--err]="toastErr()">{{ toast() }}</div> }

      <div class="bp-card find">
        <label class="find__label" for="adm-email">Find someone by email</label>
        <div class="find__row">
          <input id="adm-email" type="email" [(ngModel)]="email" placeholder="name@example.com"
                 autocomplete="off" (keyup.enter)="find()" />
          <button class="bp-btn" (click)="find()" [disabled]="busy()">{{ busy() ? 'Working…' : 'Find' }}</button>
        </div>
        <small class="hint">
          They must have signed in to BrightPath at least once before they can be given a role.
        </small>

        @if (found(); as m) {
          <div class="found">
            <div class="found__who">
              <strong>{{ m.name || m.email }}</strong>
              @if (m.name) { <span class="found__email">{{ m.email }}</span> }
              <span class="found__roles">
                @if (m.roles.length) {
                  @for (r of m.roles; track r) { <span class="tag">{{ label(r) }}</span> }
                } @else { <span class="tag tag--none">No BrightPath access</span> }
              </span>
            </div>
            <div class="found__acts">
              @for (r of roles; track r) {
                @if (m.roles.includes(r)) {
                  <button class="btn-rm" (click)="change(m, r, false)" [disabled]="busy()">Remove {{ label(r) }}</button>
                } @else {
                  <button class="btn-add" (click)="change(m, r, true)" [disabled]="busy()">Make {{ label(r) }}</button>
                }
              }
            </div>
          </div>
        }
      </div>

      <h2 class="adm__h">Who has access</h2>
      @if (loading()) {
        <div class="bp-loading"><span class="bp-spinner"></span> Loading…</div>
      } @else if (!members().length) {
        <div class="bp-empty"><p>Nobody has been given BrightPath access yet.</p></div>
      } @else {
        <ul class="list">
          @for (m of members(); track m.id) {
            <li class="list__row">
              <span class="list__who">
                <strong>{{ m.name || m.email }}</strong>
                @if (m.name) { <span class="list__email">{{ m.email }}</span> }
              </span>
              <span class="list__roles">
                @for (r of m.roles; track r) { <span class="tag">{{ label(r) }}</span> }
              </span>
              <span class="list__acts">
                @for (r of roles; track r) {
                  @if (m.roles.includes(r)) {
                    <button class="btn-rm" (click)="change(m, r, false)" [disabled]="busy()">Remove {{ label(r) }}</button>
                  }
                }
              </span>
            </li>
          }
        </ul>
      }

      <p class="note">
        A new role reaches someone the next time their session refreshes. To see it straight
        away they can sign out and back in.
      </p>
    </div></section>
  `,
  styles: [`
    .adm { padding-block: clamp(20px, 4vw, 36px); max-width: 860px; }
    .adm__h { font-size: 1.1rem; margin: 2rem 0 .8rem; color: var(--slate-900); }
    .toast { padding: .7rem 1rem; border-radius: var(--r-sm); background: #ecfdf5; color: #065f46; margin-bottom: 1rem; font-weight: 600; }
    .toast--err { background: #fef2f2; color: #991b1b; }

    .find { padding: 1.2rem; }
    .find__label { display: block; font-weight: 600; margin-bottom: .5rem; color: var(--slate-900); }
    .find__row { display: flex; gap: .6rem; flex-wrap: wrap; }
    .find__row input {
      flex: 1 1 240px; min-width: 0; padding: .7rem .9rem; font: inherit;
      border: 1px solid var(--border); border-radius: var(--r-sm); background: var(--white);
    }
    .find__row input:focus-visible { outline: 2px solid var(--brand); outline-offset: 1px; }
    .hint { display: block; margin-top: .5rem; color: var(--slate-500); font-size: .82rem; }

    .found { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); display: flex; flex-wrap: wrap; gap: .8rem; align-items: center; justify-content: space-between; }
    .found__who { display: flex; flex-direction: column; gap: .3rem; min-width: 0; }
    .found__email, .list__email { color: var(--slate-500); font-size: .85rem; }
    .found__roles, .list__roles { display: flex; gap: .35rem; flex-wrap: wrap; }
    .found__acts, .list__acts { display: flex; gap: .5rem; flex-wrap: wrap; }

    .tag { font-size: .74rem; font-weight: 700; padding: .18rem .5rem; border-radius: 999px; background: var(--brand-pale, #eef2ff); color: var(--brand-d); }
    .tag--none { background: var(--slate-100, #f1f5f9); color: var(--slate-500); }

    .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .5rem; }
    .list__row {
      display: flex; align-items: center; gap: .8rem; flex-wrap: wrap;
      padding: .8rem 1rem; border: 1px solid var(--border); border-radius: var(--r-md); background: var(--white);
    }
    .list__who { display: flex; flex-direction: column; gap: .2rem; flex: 1 1 200px; min-width: 0; }
    .list__acts { margin-left: auto; }

    .btn-add, .btn-rm {
      font: inherit; font-size: .82rem; font-weight: 600; cursor: pointer;
      padding: .5rem .8rem; min-height: 44px; border-radius: var(--r-sm); border: 1px solid var(--border); background: var(--white);
    }
    .btn-add { border-color: var(--brand); color: var(--brand-d); }
    .btn-add:hover:not(:disabled) { background: var(--brand-pale, #eef2ff); }
    .btn-rm { color: #991b1b; border-color: #fecaca; }
    .btn-rm:hover:not(:disabled) { background: #fef2f2; }
    .btn-add:disabled, .btn-rm:disabled { opacity: .55; cursor: default; }

    .note { margin-top: 1.4rem; color: var(--slate-500); font-size: .85rem; }

    @media (max-width: 560px) {
      .found, .list__row { flex-direction: column; align-items: flex-start; }
      .list__acts { margin-left: 0; }
    }
  `],
})
export class AdminComponent {
  private admin = inject(AdminService);

  readonly roles = [ROLE_TEACHER, ROLE_ADMIN];
  readonly members = signal<Member[]>([]);
  readonly found = signal<Member | null>(null);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly toast = signal<string | null>(null);
  readonly toastErr = signal(false);
  email = '';

  constructor() { this.reload(); }

  label(role: string): string { return role === ROLE_ADMIN ? 'Admin' : 'Teacher'; }

  private reload(): void {
    this.loading.set(true);
    this.admin.members().subscribe({
      next: m => { this.members.set(m); this.loading.set(false); },
      error: () => { this.loading.set(false); this.flash('Could not load the list.', true); },
    });
  }

  find(): void {
    const email = this.email.trim();
    if (!email) return;
    this.busy.set(true);
    this.admin.lookup(email).subscribe({
      next: m => { this.found.set(m); this.busy.set(false); },
      error: e => { this.found.set(null); this.busy.set(false); this.flash(this.msg(e, 'Could not find that account.'), true); },
    });
  }

  change(member: Member, role: string, granting: boolean): void {
    this.busy.set(true);
    const call = granting ? this.admin.grant(member.email, role) : this.admin.revoke(member.email, role);
    call.subscribe({
      next: updated => {
        this.busy.set(false);
        if (this.found()?.id === updated.id) this.found.set(updated);
        this.flash(`${updated.email} ${granting ? 'is now' : 'is no longer'} ${this.label(role)}.`);
        this.reload();
      },
      error: e => { this.busy.set(false); this.flash(this.msg(e, 'That change did not go through.'), true); },
    });
  }

  private msg(e: unknown, fallback: string): string {
    const err = (e as { error?: { error?: string } })?.error?.error;
    return err ?? fallback;
  }

  private flash(msg: string, err = false): void {
    this.toast.set(msg); this.toastErr.set(err);
    setTimeout(() => this.toast.set(null), 5000);
  }
}
