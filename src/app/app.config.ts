import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { AUTH_SERVICE } from '@thydda/auth-contracts';
import { SimulatedAuthService } from './auth/simulated-auth.service';
import { provideState, provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { cartFeatureKey, cartReducer } from '@thydda/movies-cart';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    SimulatedAuthService,
    { provide: AUTH_SERVICE, useExisting: SimulatedAuthService },
    provideStore(),
    ...(isDevMode() ? [provideStoreDevtools({ maxAge: 25 })] : []),
    provideState({ name: cartFeatureKey, reducer: cartReducer }),
  ],
};
