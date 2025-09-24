import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'interplanetary-space',
    loadComponent: () =>
      import('./interplanetary-space/interplanetary-space')
        .then(m => m.InterplanetarySpaceComponent)
  }
];
