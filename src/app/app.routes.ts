import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/countries/countries').then((m) => m.Countries),
  },
  {
    path: 'country/:code',
    loadComponent: () =>
      import('./pages/country-details/country-details').then((m) => m.CountryDetails),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
