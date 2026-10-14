import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, type Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AUTH_SERVICE } from '@thydda/auth-contracts';
import { routes } from '../app.routes';
import { Login } from './login';
import { SimulatedAuthService } from './simulated-auth.service';

@Component({ selector: 'app-protected-test', template: '<h1>Protected page</h1>' })
class ProtectedPage {}

describe('Shell protected routes', () => {
  const loadRemote = vi.fn<() => Promise<Routes>>();

  beforeEach(() => {
    loadRemote.mockReset();
    loadRemote.mockResolvedValue([
      { path: 'dashboard', component: ProtectedPage },
      { path: 'movies', component: ProtectedPage },
      { path: 'movies/edit', component: ProtectedPage },
    ]);
    TestBed.configureTestingModule({
      providers: [
        SimulatedAuthService,
        { provide: AUTH_SERVICE, useExisting: SimulatedAuthService },
        provideRouter(
          routes.map((route) =>
            route.path === '' ? { ...route, loadChildren: loadRemote } : route,
          ),
        ),
      ],
    });
  });

  it.each(['/dashboard', '/movies', '/movies/edit'])(
    'blocks %s before loading the remote',
    async (url) => {
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl(url, Login);
      const router = TestBed.inject(Router);
      expect(router.url).toContain('/login?');
      expect(router.parseUrl(router.url).queryParams['returnUrl']).toBe(url);
      expect(loadRemote).not.toHaveBeenCalled();
    },
  );

  it('allows a signed-in user to load the remote', async () => {
    TestBed.inject(AUTH_SERVICE).login('Ana');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/movies', ProtectedPage);
    expect(loadRemote).toHaveBeenCalledOnce();
  });

  it('returns to the protected page after login', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/movies', Login);
    const input = harness.routeNativeElement!.querySelector('input')!;
    input.value = 'Ana';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await harness.fixture.whenStable();
    harness
      .routeNativeElement!.querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/movies');
    expect(harness.routeNativeElement?.textContent).toContain('Protected page');
  });
});
