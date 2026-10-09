import { Component } from '@angular/core';
import { Routes } from '@angular/router';

import { RoutePage } from './route-page';
import { authGuard } from './guards/auth.guard';

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
import { InstructorProfilePage } from './page/instructor-profile/profile';
import { InstructorNotifications } from './page/instructor-notifications/notifications';
import { InstructorCatalog } from './page/instructor-catalog/catalog';
import { InstructorCoursePreview } from './components/instructor-course-preview/instructor-course-preview';
import { InstructorCurriculum } from './components/instructor-curriculum/curriculum';
import { InstructorLesson } from './components/instructor-lesson/lesson';
import { InstructorQuiz } from './components/instructor-quiz/quiz';
import { InstructorCertificatesComponent } from './components/instructor-certificates/instructor-certificates';
import { InstructorSection } from './components/instructor-section/instructor-section';
import { InstructorStudents } from './page/instructor-students/instructor-students';


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





import { AllCoursesPage } from './page/all-courses/all-courses';
import { Categories } from './page/catalog/categories/categories';
import { CourseDetails } from './page/catalog/course-details/course-details';
import { FrontEndTracks } from './page/catalog/front-end-tracks/front-end-tracks';
import { TrackPage } from './page/catalog/track/track';
import { AboutPage } from './page/about/about';
import { AuthComponent } from './components/auth/auth';
import { OAuthCallbackComponent } from './components/auth/oauth-callback';
import { Cart } from './page/cart/cart';
import { Payment } from './page/payment/payment';
import { WishlistComponent } from './page/wishlist/wishlist';
import { StudentDashboard } from './page/student-dashboard/student-dashboard';
import { StudentProfilePage } from './page/student-profile/student-profile';
import { StudentCertificates } from './page/student-certificates/student-certificates';
import { CoursePlayer } from './page/course-player/course-player';
import { CourseQuiz } from './page/course-quiz/course-quiz';

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
    component: InstructorCourses,
    canActivate: [authGuard]
  },

  {
    path: 'instructor-courses',
    component: InstructorCourses,
    canActivate: [authGuard]
  },

  {
    path: 'instructor-course-preview',
    component: InstructorCoursePreview,
    canActivate: [authGuard]
  },

  {
    path: 'instructor-create-course',
    component: InstructorCreateCourse,
    canActivate: [authGuard]
  },

  {
    path: 'instructor-profile',
    component: InstructorProfilePage,
    canActivate: [authGuard]
  },

  {
    path: 'instructor-certificates',
    component: InstructorCertificatesComponent,
    canActivate: [authGuard]
  },

  {
    path: 'instructor-notifications',
    component: InstructorNotifications,
    canActivate: [authGuard]
  },

  {
    path: 'students',
    component: InstructorStudents,
    canActivate: [authGuard],
  },

  {
    path: 'instructor-catalog',
    component: InstructorCatalog,
    canActivate: [authGuard]
  },

  {
    path: 'instructor-course-curriculum',
    component: InstructorCurriculum,
    canActivate: [authGuard]
  },

  {
    path: 'instructor-section',
    component: InstructorSection,
    canActivate: [authGuard]
  },

  {
    path: 'instructor-lesson',
    component: InstructorLesson,
    canActivate: [authGuard]
  },

  {
    path: 'instructor-quiz',
    component: InstructorQuiz,
    canActivate: [authGuard]
  },

  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full',
  },

  /* =========================
     CATALOG
     One page per concern: a category (with its tracks and courses), the
     full course list, and a single course. The legacy URLs below redirect
     here so existing links keep working.
  ========================== */

  {
    path: 'categories',
    component: Categories,
  },

  {
    path: 'category/:categoryId',
    component: FrontEndTracks,
  },

  {
    path: 'track/:trackId',
    component: TrackPage,
  },

  {
    path: 'courses',
    component: AllCoursesPage,
  },

  {
    path: 'student-dashboard',
    component: StudentDashboard,
    canActivate: [authGuard],
  },

  {
    path: 'learning',
    component: StudentDashboard,
    canActivate: [authGuard],
  },

  {
    path: 'profile',
    component: StudentProfilePage,
    canActivate: [authGuard],
  },

  {
    path: 'certificates',
    component: StudentCertificates,
    canActivate: [authGuard],
  },

  {
    path: 'course/:courseId',
    component: CourseDetails,
  },

  {
    path: 'learn/:courseId/quiz/:quizId',
    component: CourseQuiz,
    canActivate: [authGuard],
  },

  {
    path: 'learn/:courseId',
    component: CoursePlayer,
    canActivate: [authGuard],
  },

  // Legacy catalog URLs. The category slugs land on the category list; the
  // deeper static paths were never backed by data, so they go to the course list.
  { path: 'catalog', pathMatch: 'full', redirectTo: 'categories' },
  { path: 'catalog/:slug', pathMatch: 'full', redirectTo: 'categories' },

  /* =========================
     ADMIN ROUTES
  ========================= */

  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [authGuard]
  },

  {
    path: 'admin-users',
    component: AdminUsers,
    canActivate: [authGuard]
  },

  {
    path: 'admin-courses',
    component: AdminCourses,
    canActivate: [authGuard]
  },

  {
    path: 'admin-create-course',
    component: AdminCreateCourse,
    canActivate: [authGuard]
  },

  {
    path: 'admin-categories',
    component: AdminCategories,
    canActivate: [authGuard]
  },

  {
    path: 'admin-tracks',
    component: AdminTracks,
    canActivate: [authGuard]
  },

  {
    path: 'admin-reports',
    component: AdminReports,
    canActivate: [authGuard]
  },

  {
    path: 'admin-notifications',
    component: AdminNotifications,
    canActivate: [authGuard]
  },

  {
    path: 'admin-profile',
    component: AdminProfile,
    canActivate: [authGuard]
  },


  /* =========================
     GENERAL PAGES
  ========================= */

  {
    path: 'instructor/:name',
    loadComponent: () => import('./page/instructor-public/instructor-public').then(m => m.InstructorPublicPage)
  },

  {
    path: 'about',
    component: AboutPage
  },

  {
    path: 'auth/callback',
    component: OAuthCallbackComponent,
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
  component: Cart,
  canActivate: [authGuard]
},
{
  path: 'payment',
  component: Payment,
  canActivate: [authGuard]
},
{
  path: 'wishlist',
  component: WishlistComponent,
  canActivate: [authGuard]
},

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
  {
    path: 'search',
    redirectTo: 'courses',
    pathMatch: 'full'
},


  /* =========================
     FALLBACK
  ========================= */

  {
    path: '**',
    redirectTo: ''
  }

];

