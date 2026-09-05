import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

/** A user holding at least one BrightPath role. */
export interface Member {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
}

/** Server's view of who you are, read from the database rather than your token. */
export interface Access {
  isAdmin: boolean;
  isTeacher: boolean;
  email: string | null;
}

export const ROLE_ADMIN = 'brightpath-admin';
export const ROLE_TEACHER = 'teacher';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private api = `${environment.apiBaseUrl}/api/BrightPathAdmin`;

  /**
   * Authoritative access, cached for the session. The token's role claims can lag a
   * grant by up to the access-token lifetime, so the UI trusts this instead.
   */
  readonly access = signal<Access | null>(null);

  /** Safe to call unauthenticated - the server answers rather than 403ing. */
  loadAccess(): Observable<Access> {
    return this.http.get<Access>(`${this.api}/me`).pipe(tap(a => this.access.set(a)));
  }

  members(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.api}/users`);
  }

  lookup(email: string): Observable<Member> {
    return this.http.get<Member>(`${this.api}/lookup`, { params: { email } });
  }

  grant(email: string, role: string): Observable<Member> {
    return this.http.post<Member>(`${this.api}/grant`, { email, role });
  }

  revoke(email: string, role: string): Observable<Member> {
    return this.http.post<Member>(`${this.api}/revoke`, { email, role });
  }
}
