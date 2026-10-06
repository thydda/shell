import { federation } from './federation';

federation.then(() => import('./bootstrap')).catch((err) => console.error(err));
