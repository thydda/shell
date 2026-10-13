import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login').then((module) => module.Login),
  },
  {
    path: '',
    canMatch: [authGuard],
    loadChildren: () => {
      if (typeof document === 'undefined') {
        return Promise.resolve<Routes>([]);
      }

      return import('../federation').then(({ federation }) =>
        federation.then(({ loadRemoteModule }) =>
          loadRemoteModule<{ routes: Routes }>('mfe1', './Routes').then((remote) => remote.routes),
        ),
      );
    },
  },
];
