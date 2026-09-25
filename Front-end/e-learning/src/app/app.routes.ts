import { Routes } from '@angular/router';

import { RoutePage } from './route-page';

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

  page(
    'categories',
    'LEARN WITH PURPOSE',
    'Categories',
    'Explore focused learning areas and find the skills that move your career forward.'
  ),

  page(
    'courses',
    'CURATED FOR YOU',
    'Courses',
    'Discover practical, expert-led courses built for real progress.'
  ),

  page(
    'about',
    'ABOUT PATHWAYED',
    'About PathwayEd',
    'A flexible learning platform designed to turn curiosity into confident, career-ready skills.'
  ),

  page(
    'login',
    'WELCOME BACK',
    'Log In',
    'Your learning journey is waiting for you.'
  ),

  page(
    'signup',
    'START YOUR JOURNEY',
    'Create Your Account',
    'Join PathwayEd and start building your next professional chapter.'
  ),

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
    'wishlist',
    'SAVED FOR LATER',
    'Wishlist',
    'Keep the courses and learning paths you want to explore next.'
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