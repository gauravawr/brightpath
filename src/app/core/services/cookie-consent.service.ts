import { Injectable, signal } from '@angular/core';

const KEY = 'bp_cookie_consent';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  /** null = undecided, true = accepted, false = rejected */
  readonly state = signal<boolean | null>(this.read());

  granted(): boolean { return this.state() === true; }
  decided(): boolean { return this.state() !== null; }

  accept(): void { this.set(true); }
  reject(): void { this.set(false); }

  private set(v: boolean): void {
    this.state.set(v);
    if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, v ? '1' : '0');
  }
  private read(): boolean | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(KEY);
    return raw === null ? null : raw === '1';
  }
}
