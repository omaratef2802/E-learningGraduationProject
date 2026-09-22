import { Routes } from '@angular/router';

import { Categories } from './pages/catalog/categories/categories';
import { Track } from './pages/catalog/track/track';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'catalog/web-development',
    pathMatch: 'full'
  },

  {
    path: 'catalog',
    component: Categories
  },

  {
    path: 'catalog/web-development',
    component: Track
  },

  // All Tracks
  {
    path: 'catalog/web-development/programming',
    component: Track
  },

  {
    path: 'catalog/web-development/front-end',
    component: Track
  },

  {
    path: 'catalog/web-development/back-end',
    component: Track
  },

  {
    path: 'catalog/web-development/full-stack',
    component: Track
  },

  {
    path: 'catalog/web-development/mobile',
    component: Track
  }

];