import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AUTH_SERVICE } from '@thydda/auth-contracts';
import { SimulatedAuthService } from './auth/simulated-auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    SimulatedAuthService,
    { provide: AUTH_SERVICE, useExisting: SimulatedAuthService },
  ],
};
