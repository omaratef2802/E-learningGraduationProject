import { Component } from '@angular/core';
import { Routes } from '@angular/router';

import { RoutePage } from './route-page';

@Component({
  standalone: true,
  template: '',
})
export class HomeComponent {}

/* =========================
   INSTRUCTOR
========================= */
import { InstructorCourses } from './page/instructor-course/coursee';
import { InstructorCreateCourse } from './page/instructor-create-course/create-course';
import { InstructorProfile } from './page/instructor-profile/profile';
import { InstructorNotifications } from './page/instructor-notifications/notifications';
import { InstructorCatalog } from './page/instructor-catalog/catalog';
import { InstructorCoursePreview } from './components/instructor-course-preview/instructor-course-preview';
import { InstructorCurriculum } from './components/instructor-curriculum/curriculum';
import { InstructorLesson } from './components/instructor-lesson/lesson';
import { InstructorQuiz } from './components/instructor-quiz/quiz';
import { InstructorCertificatesComponent } from './components/instructor-certificates/instructor-certificates';
import { InstructorSection } from './components/instructor-section/instructor-section';


/* =========================
   ADMIN
========================= */

import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { AdminUsers } from './components/admin-users/admin-users';
import { AdminCourses } from './components/admin-courses/admin-courses';
import { AdminCategories } from './components/admin-categories/admin-categories';
import { AdminTracks } from './components/admin-tracks/admin-tracks';
import { AdminReports } from './components/admin-reports/admin-reports';
import { AdminNotifications } from './components/admin-notifications/admin-notifications';
import { AdminProfile } from './components/admin-profile/admin-profile';
import { AdminCreateCourse } from './components/admin-create-course/admin-create-course';





import { Categories } from './page/catalog/categories/categories';
import { CourseDetails } from './page/catalog/course-details/course-details';
import { FrontEndTracks } from './page/catalog/front-end-tracks/front-end-tracks';
import { ReactCourses } from './page/catalog/courses/courses';
import { Track } from './page/catalog/track/track';
import { AboutPage } from './page/about/about';
import { AuthComponent } from './components/auth/auth';
import { Cart } from './page/cart/cart';
import { Payment } from './page/payment/payment';
import { WishlistComponent } from './page/wishlist/wishlist';

/* =========================
   GENERAL PAGE HELPER
========================= */

const page = (
  path: string,
  eyebrow: string,
  title: string,
  description: string
) => ({
  path,
  component: RoutePage,
  data: {
    page: {
      eyebrow,
      title,
      description
    }
  }
});


/* =========================
   ROUTES
========================= */

export const routes: Routes = [

  /* =========================
     INSTRUCTOR ROUTES
  ========================= */
  {
    path: 'instructor-dashboard',
    redirectTo: 'instructor-courses',
    pathMatch: 'full'
  },

  {
    path: 'instructor-courses',
    component: InstructorCourses
  },

  {
    path: 'instructor-course-preview',
    component: InstructorCoursePreview
  },

  {
    path: 'instructor-create-course',
    component: InstructorCreateCourse
  },

  {
    path: 'instructor-profile',
    component: InstructorProfile
  },

  {
    path: 'instructor-certificates',
    component: InstructorCertificatesComponent
  },

  {
    path: 'instructor-notifications',
    component: InstructorNotifications
  },

  {
    path: 'instructor-catalog',
    component: InstructorCatalog
  },

  {
    path: 'instructor-course-curriculum',
    component: InstructorCurriculum
  },

  {
    path: 'instructor-section',
    component: InstructorSection
  },

  {
    path: 'instructor-lesson',
    component: InstructorLesson
  },

  {
    path: 'instructor-quiz',
    component: InstructorQuiz
  },

  {
    path: '',
    component: HomeComponent,
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
    path: 'catalog/web-development/front-end/html-css',
    component: Track,
  },

  {
    path: 'catalog/web-development/front-end/javascript',
    component: Track,
  },

  {
    path: 'catalog/web-development/front-end/typescript',
    component: Track,
  },

  {
    path: 'catalog/web-development/front-end/vue',
    component: Track,
  },

  {
    path: 'catalog/web-development/front-end/angular',
    component: Track,
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


  /* =========================
     ADMIN ROUTES
  ========================= */

  {
    path: 'admin-dashboard',
    component: AdminDashboard
  },

  {
    path: 'admin-users',
    component: AdminUsers
  },

  {
    path: 'admin-courses',
    component: AdminCourses
  },

  {
    path: 'admin-create-course',
    component: AdminCreateCourse
  },

  {
    path: 'admin-categories',
    component: AdminCategories
  },

  {
    path: 'admin-tracks',
    component: AdminTracks
  },

  {
    path: 'admin-reports',
    component: AdminReports
  },

  {
    path: 'admin-notifications',
    component: AdminNotifications
  },

  {
    path: 'admin-profile',
    component: AdminProfile
  },


  /* =========================
     GENERAL PAGES
  ========================= */

  {
    path: 'categories',
    component: Categories
  },

  {
    path: 'courses',
    loadComponent: () => import('./page/all-courses/all-courses').then(m => m.AllCoursesPage)
  },

  {
    path: 'about',
    component: AboutPage
  },

  {
    path: 'login',
    component: AuthComponent
  },

  {
    path: 'signup',
    component: AuthComponent
  },

  {
    path: 'register',
    component: AuthComponent
  },
  {
  path: 'cart',
  component: Cart
},
{
  path: 'payment',
  component: Payment
},
{
  path: 'wishlist',
  component: WishlistComponent
},

  page(
    'profile',
    'YOUR SPACE',
    'Profile',
    'Manage your professional profile, achievements, and learning progress.'
  ),

  page(
    'students',
    'YOUR COMMUNITY',
    'Students',
    'Review your learners, engagement, and course activity.'
  ),

  page(
    'learning',
    'YOUR LEARNING',
    'My Learning',
    'Pick up where you left off and keep your momentum going.'
  ),

  page(
    'certificates',
    'YOUR ACHIEVEMENTS',
    'Certificates',
    'View and share the credentials you have earned.'
  ),
  page(
    'help',
    'WE ARE HERE TO HELP',
    'Help Center',
    'Find answers and guidance whenever you need support.'
  ),

  page(
    'contact',
    'GET IN TOUCH',
    'Contact',
    'Reach out to the PathwayEd team.'
  ),

  page(
    'notifications',
    'STAY UPDATED',
    'Notifications',
    'Keep track of course activity, learner updates, and important announcements.'
  ),

  page(
    'settings',
    'WORKSPACE SETTINGS',
    'Settings',
    'Manage your instructor workspace preferences.'
  ),

  page(
    'search',
    'SEARCH RESULTS',
    'Find Your Next Course',
    'Search results will appear here as you explore our learning catalog.'
  ),


  /* =========================
     FALLBACK
  ========================= */

  {
    path: '**',
    redirectTo: ''
  }

];