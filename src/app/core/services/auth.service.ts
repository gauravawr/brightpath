import { Injectable, computed, signal } from '@angular/core';
import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { environment } from '../../../environments/environment';

export interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  roles: string[];
}

/**
 * OIDC auth against the shared eApp.AuthServer2 (client: brightpath-spa).
 * On localhost, a bypass provides a mock teacher so the UI is workable without the auth server.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<CurrentUser | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  /**
   * eApp seeds the role lowercase ("teacher", matching the existing "consumer"
   * convention) so the token carries that casing. Compare case-insensitively,
   * as BrightPathControllerBase.IsTeacher does on the server.
   */
  readonly isTeacher = computed(() =>
    this._user()?.roles.some(r => r.toLowerCase() === 'teacher') ?? false);

  private mgr?: UserManager;

  private manager(): UserManager {
    if (!this.mgr) {
      this.mgr = new UserManager({
        authority: environment.idServerEndpoint,
        client_id: environment.clientId,
        redirect_uri: `${environment.webAppEndpoint}signin-callback`,
        post_logout_redirect_uri: `${environment.webAppEndpoint}signout-callback`,
        response_type: 'code',
        scope: 'openid profile email roles projects-api offline_access',
        userStore: new WebStorageStateStore({ store: window.localStorage }),
        automaticSilentRenew: true,
      });
    }
    return this.mgr;
  }

  /** Restore session on app start. */
  async init(): Promise<void> {
    if (environment.localhostAuthBypassEnabled) {
      this._user.set({ id: 'local-teacher', name: 'Demo Teacher', email: 'teacher@brightpath.local', roles: ['Teacher'] });
      return;
    }
    try {
      const u = await this.manager().getUser();
      if (u && !u.expired) this.setFromOidc(u);
    } catch { /* not signed in */ }
  }

  /**
   * Pull a fresh token without a round trip through the login page. The auth server
   * re-reads roles from the database on every refresh, so this is how a role granted
   * a moment ago becomes usable immediately instead of at the next token expiry.
   * Returns false if there is no usable refresh token.
   */
  async refreshSession(): Promise<boolean> {
    if (environment.localhostAuthBypassEnabled) return false;
    try {
      const u = await this.manager().signinSilent();
      if (!u) return false;
      this.setFromOidc(u);
      return true;
    } catch {
      return false;
    }
  }

  login(): Promise<void> { return this.manager().signinRedirect(); }
  loginWithGoogle(): Promise<void> { return this.manager().signinRedirect({ extraQueryParams: { idp: 'Google' } }); }

  async completeLogin(): Promise<void> {
    const u = await this.manager().signinRedirectCallback();
    this.setFromOidc(u);
  }

  async logout(): Promise<void> {
    this._user.set(null);
    if (!environment.localhostAuthBypassEnabled) await this.manager().signoutRedirect();
  }

  async accessToken(): Promise<string | null> {
    if (environment.localhostAuthBypassEnabled) return 'dev-token';
    const u = await this.manager().getUser();
    return u?.access_token ?? null;
  }

  private setFromOidc(u: User): void {
    const p = u.profile as Record<string, unknown>;
    const rawRoles = p['role'] ?? p['roles'];
    const roles = Array.isArray(rawRoles) ? rawRoles as string[] : rawRoles ? [String(rawRoles)] : [];
    this._user.set({
      id: String(p['sub'] ?? ''),
      name: String(p['name'] ?? p['preferred_username'] ?? 'Learner'),
      email: p['email'] ? String(p['email']) : undefined,
      roles,
    });
  }
}
