import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppSettings {
  donationsEnabled: boolean;
  featuredSubjectSlug?: string;
}

const DEFAULTS: AppSettings = { donationsEnabled: true };

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  readonly settings = signal<AppSettings>(DEFAULTS);

  load(): void {
    this.http.get<AppSettings>(`${environment.apiBaseUrl}/api/BrightPathSettings`).pipe(
      tap(s => this.settings.set({ ...DEFAULTS, ...s })),
      catchError(() => of(DEFAULTS)),
    ).subscribe();
  }
}
