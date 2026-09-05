import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PaymentConfig { publishableKey: string; }
export interface CreateIntentRequest { amount: number; currency: string; note?: string; }
export interface CreateIntentResponse { clientSecret: string; }

/**
 * Donation flow — reuses the shared eApp PaymentController (Stripe).
 * BrightPath is free; donations are optional.
 */
@Injectable({ providedIn: 'root' })
export class DonationService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/api/Payment`;

  config(): Observable<PaymentConfig> {
    return this.http.get<PaymentConfig>(`${this.base}/config`);
  }

  createIntent(req: CreateIntentRequest): Observable<CreateIntentResponse> {
    return this.http.post<CreateIntentResponse>(`${this.base}/create-payment-intent`, {
      ...req,
      product: 'BrightPath',
      kind: 'donation',
    });
  }
}
