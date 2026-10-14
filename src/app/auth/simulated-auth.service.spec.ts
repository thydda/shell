import { TestBed } from '@angular/core/testing';
import { AUTH_SERVICE } from '@thydda/auth-contracts';
import { SimulatedAuthService } from './simulated-auth.service';

describe('SimulatedAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SimulatedAuthService,
        { provide: AUTH_SERVICE, useExisting: SimulatedAuthService },
      ],
    });
  });

  it('provides one session through the token and the service', () => {
    const auth = TestBed.inject(AUTH_SERVICE);
    expect(auth).toBe(TestBed.inject(SimulatedAuthService));
    expect(auth.user()).toBeNull();
    auth.login(' Ana ');
    expect(auth.user()?.name).toBe('Ana');
    auth.login('Luis');
    expect(auth.user()?.name).toBe('Luis');
    auth.logout();
    expect(auth.user()).toBeNull();
  });

  it('rejects blank names without replacing the current session', () => {
    const auth = TestBed.inject(AUTH_SERVICE);
    auth.login('Ana');
    expect(() => auth.login('   ')).toThrow('Enter a name');
    expect(auth.user()?.name).toBe('Ana');
  });
});
