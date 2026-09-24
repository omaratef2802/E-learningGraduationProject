import { Routes } from '@angular/router';
import { CourseDetails } from './features/course/pages/course-details/course-details';
import { QuizPlayer } from './features/quiz/pages/quiz-player/quiz-player';
import { CertificateResult } from './features/certificate/pages/certificate-result/certificate-result';
import { ComingSoon } from './shared/coming-soon';

export const routes: Routes = [
  { path: '', component: CourseDetails },
  { path: 'courses/:id', component: CourseDetails },
  { path: 'quiz/:sectionId', component: QuizPlayer },
  { path: 'quiz', component: QuizPlayer },
  { path: 'certificate', component: CertificateResult },
  { path: 'login', component: ComingSoon },
  { path: 'register', component: ComingSoon },
  { path: 'cart', component: ComingSoon },
];