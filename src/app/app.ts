import { Component, effect, inject } from '@angular/core';
import { AUTH_SERVICE, type AuthService } from '@thydda/auth-contracts';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  template: `
    <header class="app-header">
      <div class="app-header-inner">
        <a class="app-brand" routerLink="/dashboard">Library</a>
        @if (auth.user()) {
          <nav class="app-nav" aria-label="Main navigation">
            <a
              class="app-nav-link"
              routerLink="/dashboard"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              >Home</a
            >
            <a
              class="app-nav-link"
              routerLink="/movies"
              routerLinkActive="active"
              ariaCurrentWhenActive="page"
              >Movies</a
            >
          </nav>
        }
        <div class="d-flex flex-wrap align-items-center gap-2">
          <span role="status">
            @if (auth.user(); as user) {
              Signed in as {{ user.name }}
            } @else {
              Signed out
            }
          </span>
          @if (auth.user()) {
            <button class="btn btn-outline-light" type="button" (click)="auth.logout()">
              Sign out
            </button>
          } @else {
            <a class="btn btn-outline-light" routerLink="/login">Sign in</a>
          }
        </div>
      </div>
    </header>
    <main class="app-main"><router-outlet /></main>
  `,
})
export class App {
  protected readonly auth: AuthService = inject<AuthService>(AUTH_SERVICE);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (!this.auth.user() && this.router.navigated && !this.router.url.startsWith('/login')) {
        void this.router.navigateByUrl('/login', { replaceUrl: true }).catch(console.error);
      }
    });
  }
}
