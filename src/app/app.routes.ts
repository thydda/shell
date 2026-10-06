import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
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
