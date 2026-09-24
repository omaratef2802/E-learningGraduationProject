import { Routes } from '@angular/router';

import { Categories } from './pages/catalog/categories/categories';
import { CourseDetails } from './pages/catalog/course-details/course-details';
import { FrontEndTracks } from './pages/catalog/front-end-tracks/front-end-tracks';
import { ReactCourses } from './pages/catalog/react-courses/react-courses';
import { Track } from './pages/catalog/track/track';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalog/web-development',
    pathMatch: 'full',
  },
  {
    path: 'catalog',
    component: Categories,
  },
  {
    path: 'catalog/web-development',
    component: Track,
  },
  {
    path: 'catalog/languages',
    component: Categories,
  },
  {
    path: 'catalog/ui-ux-design',
    component: Categories,
  },
  {
    path: 'catalog/business',
    component: Categories,
  },
  {
    path: 'catalog/web-development/programming',
    component: Track,
  },
  {
    path: 'catalog/web-development/front-end',
    component: Track,
  },
  {
    path: 'catalog/web-development/front-end/tracks',
    component: FrontEndTracks,
  },
  {
    path: 'catalog/web-development/front-end/react',
    component: ReactCourses,
  },
  {
    path: 'catalog/web-development/front-end/react/course/:slug',
    component: CourseDetails,
  },
  {
    path: 'catalog/web-development/back-end',
    component: Track,
  },
  {
    path: 'catalog/web-development/full-stack',
    component: Track,
  },
  {
    path: 'catalog/web-development/mobile',
    component: Track,
  },
];