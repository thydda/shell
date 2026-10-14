import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AUTH_SERVICE } from '@thydda/auth-contracts';
import { SimulatedAuthService } from './auth/simulated-auth.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        SimulatedAuthService,
        { provide: AUTH_SERVICE, useExisting: SimulatedAuthService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-brand')?.textContent?.trim()).toBe('Library');
  });

  it('updates the header on login and signs out through the shared service', async () => {
    const fixture = TestBed.createComponent(App);
    const auth = TestBed.inject(AUTH_SERVICE);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Signed out');
    auth.login('Ana');
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;
    expect(page.textContent).toContain('Signed in as Ana');
    page.querySelector<HTMLButtonElement>('button')?.click();
    await fixture.whenStable();
    expect(auth.user()).toBeNull();
    expect(page.textContent).toContain('Signed out');
  });
});
