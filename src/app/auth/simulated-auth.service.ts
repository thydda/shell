import { Injectable, signal } from '@angular/core';
import type { AuthService, AuthUser } from '@thydda/auth-contracts';

@Injectable()
export class SimulatedAuthService implements AuthService {
  private readonly session = signal<AuthUser | null>(null);
  readonly user = this.session.asReadonly();

  login(name: string): void {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new Error('Enter a name to sign in.');
    }
    this.session.set({ id: 'demo-user', name: normalizedName });
  }

  logout(): void {
    this.session.set(null);
  }
}
