import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import {
  InstructorData,
  AdminStats,
  AdminUser,
  AdminCourse,
  AdminActivity
} from '../../page/instructor-data';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminSidebar
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {

  private readonly router = inject(Router);

  public readonly data = inject(InstructorData);

  stats!: AdminStats;

  recentUsers: AdminUser[] = [];

  recentCourses: AdminCourse[] = [];

  recentActivities: AdminActivity[] = [];

  loading = false;

  errorMessage = '';


  // ==================================================
  // INITIALIZATION
  // ==================================================

  ngOnInit(): void {
    this.loadDashboard();
  }


  // ==================================================
  // LOAD DASHBOARD DATA
  // ==================================================

  loadDashboard(): void {

    try {

      this.loading = true;

      this.errorMessage = '';

      this.stats =
        this.data.getAdminStats();

      this.recentUsers =
        this.data.getAdminRecentUsers();

      this.recentCourses =
        this.data.getAdminRecentCourses();

      this.recentActivities =
        this.data.getAdminRecentActivities();

    } catch (error) {

      console.error(
        'Admin Dashboard Error:',
        error
      );

      this.errorMessage =
        'Unable to load dashboard data.';

    } finally {

      this.loading = false;

    }
  }


  // ==================================================
  // ADMIN NAVIGATION
  // ==================================================

  openUsers(): void {

    this.router.navigate([
      '/admin-users'
    ]);

  }


  openCourses(): void {

    this.router.navigate([
      '/admin-courses'
    ]);

  }


  openProfile(): void {

    this.router.navigate([
      '/admin-profile'
    ]);

  }


  openNotifications(): void {

    this.router.navigate([
      '/admin-notifications'
    ]);

  }


  openCategories(): void {

    this.router.navigate([
      '/admin-categories'
    ]);

  }


  openReports(): void {

    this.router.navigate([
      '/admin-reports'
    ]);

  }


  openTracks(): void {

    this.router.navigate([
      '/admin-tracks'
    ]);

  }


  // ==================================================
  // QUICK ACTIONS
  // ==================================================

  addCourse(): void {

    this.router.navigate([
      '/admin-courses'
    ]);

  }


  addInstructor(): void {

    this.router.navigate([
      '/admin-users'
    ]);

  }


  // ==================================================
  // ADMIN PROFILE
  // ==================================================

  get profileName(): string {

    return (
      `${this.data.admin.firstName} ` +
      `${this.data.admin.lastName}`
    );

  }


  get profileInitials(): string {

    return (
      this.data.admin.firstName.charAt(0) +
      this.data.admin.lastName.charAt(0)
    ).toUpperCase();

  }


  // ==================================================
  // USER INITIALS
  // ==================================================

  getUserInitials(
    name: string
  ): string {

    const parts = name
      .trim()
      .split(' ')
      .filter(Boolean);

    if (parts.length === 0) {

      return 'U';

    }

    if (parts.length === 1) {

      return parts[0]
        .slice(0, 2)
        .toUpperCase();

    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();

  }


  // ==================================================
  // ACTIVITY ICON
  // ==================================================

  getActivityIcon(
    type: AdminActivity['type']
  ): string {

    switch (type) {

      case 'User':
        return '♙';

      case 'Course':
        return '▣';

      case 'Enrollment':
        return '↗';

      case 'Certificate':
        return '✪';

      default:
        return '•';

    }

  }


  // ==================================================
  // COURSE STATUS
  // ==================================================

  getCourseStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');

  }

}