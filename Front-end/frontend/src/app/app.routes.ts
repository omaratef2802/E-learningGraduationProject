import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout';
import {
  DashboardComponent,
  CoursesComponent,
  AssessmentsComponent,
  CertificatesComponent,
  NotificationsComponent,
  WishlistComponent,
  SettingsComponent
} from './features';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'courses', component: CoursesComponent },
      { path: 'assessments', component: AssessmentsComponent },
      { path: 'certificates', component: CertificatesComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'wishlist', component: WishlistComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
