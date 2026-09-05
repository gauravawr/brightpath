import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DonationService } from '../../core/services/donation.service';
import { SettingsService } from '../../core/services/settings.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { environment } from '../../../environments/environment';

declare global { interface Window { Stripe?: (key: string) => any; } }

type Phase = 'choose' | 'paying' | 'done' | 'disabled';

@Component({
  selector: 'bp-support',
  standalone: true,
  imports: [TranslateModule, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
})
export class SupportComponent {
  private donation = inject(DonationService);
  private settings = inject(SettingsService);
  private analytics = inject(AnalyticsService);

  readonly phase = signal<Phase>('choose');
  readonly amounts = [5, 10, 25, 50];
  readonly amount = signal(10);
  readonly custom = signal<number | null>(null);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  private payEl = viewChild<ElementRef<HTMLDivElement>>('payEl');
  private stripe: any;
  private elements: any;

  constructor() {
    if (!this.settings.settings().donationsEnabled) this.phase.set('disabled');
  }

  pick(a: number): void { this.amount.set(a); this.custom.set(null); }
  setCustom(v: string): void { const n = parseFloat(v); this.custom.set(isNaN(n) ? null : n); }
  effectiveAmount(): number { return this.custom() && this.custom()! > 0 ? this.custom()! : this.amount(); }

  async proceed(): Promise<void> {
    this.error.set(null);
    const amt = this.effectiveAmount();
    if (amt < 1) { this.error.set('Please choose at least $1.'); return; }
    this.busy.set(true);
    try {
      const cfg = await firstValue(this.donation.config());
      await loadStripeJs();
      if (!window.Stripe) throw new Error('Stripe failed to load');
      this.stripe = window.Stripe(cfg.publishableKey);

      const intent = await firstValue(this.donation.createIntent({ amount: amt, currency: 'usd', note: 'BrightPath donation' }));
      this.elements = this.stripe.elements({ clientSecret: intent.clientSecret, appearance: { theme: 'flat', variables: { colorPrimary: '#4f46e5' } } });
      this.phase.set('paying');
      // wait a tick for the container to render, then mount
      setTimeout(() => this.elements.create('payment').mount(this.payEl()!.nativeElement), 0);
    } catch {
      this.error.set('Could not start the donation. Please try again later.');
    } finally {
      this.busy.set(false);
    }
  }

  async confirm(): Promise<void> {
    this.busy.set(true);
    this.error.set(null);
    try {
      const { error } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: { return_url: `${environment.webAppEndpoint}en/support` },
        redirect: 'if_required',
      });
      if (error) { this.error.set(error.message ?? 'Payment failed.'); }
      else { this.phase.set('done'); this.analytics.track('donate', { amount: this.effectiveAmount() }); }
    } catch {
      this.error.set('Payment could not be completed.');
    } finally {
      this.busy.set(false);
    }
  }
}

function firstValue<T>(obs: import('rxjs').Observable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const sub = obs.subscribe({ next: v => { resolve(v); sub.unsubscribe(); }, error: reject });
  });
}

let stripePromise: Promise<void> | null = null;
function loadStripeJs(): Promise<void> {
  if (window.Stripe) return Promise.resolve();
  if (stripePromise) return stripePromise;
  stripePromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://js.stripe.com/v3/';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('stripe load failed'));
    document.head.appendChild(s);
  });
  return stripePromise;
}
