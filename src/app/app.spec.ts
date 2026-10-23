import { provideState, provideStore, Store } from '@ngrx/store';
import { cartActions, cartFeatureKey, cartReducer, type Movie } from '@thydda/movies-cart';
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
        provideStore(),
        provideState({ name: cartFeatureKey, reducer: cartReducer }),
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

  it('shows shared cart updates in the signed-in header', async () => {
    const fixture = TestBed.createComponent(App);
    const auth = TestBed.inject(AUTH_SERVICE);
    const store = TestBed.inject(Store);
    const movie: Movie = {
      id: 1,
      title: 'Arrival',
      director: 'Denis Villeneuve',
      year: 2016,
      summary: 'Visitors arrive.',
      poster: '/posters/arrival.jpg',
    };
    const page = fixture.nativeElement as HTMLElement;
    const cartText = () => page.querySelector('nav span.app-nav-link')?.textContent?.trim();
    await fixture.whenStable();
    expect(cartText()).toBeUndefined();
    auth.login('Ana');
    await fixture.whenStable();
    expect(cartText()).toBe('Cart (0)');
    store.dispatch(cartActions.itemAdded({ item: movie }));
    await fixture.whenStable();
    expect(cartText()).toBe('Cart (1)');
    store.dispatch(cartActions.itemAdded({ item: { ...movie, id: 2 } }));
    await fixture.whenStable();
    expect(cartText()).toBe('Cart (2)');
    store.dispatch(cartActions.itemRemoved({ itemId: 1 }));
    await fixture.whenStable();
    expect(cartText()).toBe('Cart (1)');
    auth.logout();
    await fixture.whenStable();
    expect(cartText()).toBeUndefined();
    auth.login('Ana');
    await fixture.whenStable();
    expect(cartText()).toBe('Cart (1)');
    store.dispatch(cartActions.itemRemoved({ itemId: 2 }));
    await fixture.whenStable();
    expect(cartText()).toBe('Cart (0)');
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
