import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AUTH_SERVICE } from '@thydda/auth-contracts';
import { Login } from './login';
import { SimulatedAuthService } from './simulated-auth.service';

describe('Login', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        SimulatedAuthService,
        { provide: AUTH_SERVICE, useExisting: SimulatedAuthService },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  it('signs in with the entered name and displays the session', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    const input = page.querySelector('input')!;
    input.value = 'Ana';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(TestBed.inject(AUTH_SERVICE).user()?.name).toBe('Ana');
    expect(page.querySelector('[role="status"]')?.textContent).toContain('Ana');
  });

  it('shows an error instead of creating an empty session', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    page.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(TestBed.inject(AUTH_SERVICE).user()).toBeNull();
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('Enter a name');
  });
});
