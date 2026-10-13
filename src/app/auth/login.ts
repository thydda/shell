import { Component, inject, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { AUTH_SERVICE, type AuthService } from '@thydda/auth-contracts';

@Component({
  selector: 'app-login',
  imports: [FormField],
  template: `
    <section aria-labelledby="login-title">
      <h1 id="login-title">Demo sign in</h1>
      <p>This simulated session lasts until you reload the page. No password is needed.</p>
      <form (submit)="signIn($event)">
        <label class="form-label" for="login-name">Your name</label>
        <input
          class="form-control"
          id="login-name"
          autocomplete="name"
          [formField]="loginForm.name"
        />
        @if (error()) {
          <p class="text-danger" role="alert">{{ error() }}</p>
        }
        @if (!auth.user()) {
          <button class="btn btn-primary mt-3" type="submit">Sign in</button>
        }
      </form>
      <p class="mt-3" role="status">
        @if (auth.user(); as user) {
          Signed in as {{ user.name }}.
        } @else {
          Signed out.
        }
      </p>
    </section>
  `,
  styles: `
    form {
      max-inline-size: 24rem;
    }
  `,
})
export class Login {
  protected readonly auth: AuthService = inject<AuthService>(AUTH_SERVICE);
  protected readonly model = signal({ name: '' });
  protected readonly loginForm = form(this.model, (fields) => required(fields.name));
  protected readonly error = signal<string | null>(null);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected signIn(event: Event): void {
    event.preventDefault();
    this.error.set(null);
    try {
      this.auth.login(this.model().name);
      const requestedUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const returnUrl =
        requestedUrl && /^\/(dashboard|movies)(\/|\?|$)/.test(requestedUrl)
          ? requestedUrl
          : '/dashboard';
      void this.router.navigateByUrl(returnUrl).catch(() => {
        this.error.set('Signed in, but unable to open the requested page.');
      });
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Unable to sign in.');
    }
  }
}
