import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { DASHBOARD_CONFIG } from './dashboard.config';
import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import { InstructorData } from '../instructor-data';

@Component({
  selector: 'app-instructor-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    InstructorSidebar
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class InstructorDashboard {
  private readonly router = inject(Router);

  protected readonly data = inject(InstructorData);
  protected readonly config = DASHBOARD_CONFIG;

  protected activeNav = 'Dashboard';
  protected query = '';
  protected status = 'All Status';
  protected track = 'All Tracks';
  protected currentPage = 1;
  protected readonly pageSize = 4;
  protected emptyView = false;

  setActiveNav(item: string): void {
    this.activeNav = item;

    const routes: Record<string, string> = {
      Dashboard: '/instructor-dashboard',
      'My Courses': '/instructor-catalog',
      'Create Course': '/instructor-create-course',
      Students: '/students',
      Certificates: '/certificates',
      Notifications: '/instructor-notifications',
      Profile: '/instructor-profile'
    };

    const route = routes[item];

    if (route && this.router.url !== route) {
      this.router.navigate([route]);
    }
  }

  setPage(page: number): void {
    this.currentPage = Math.max(
      1,
      Math.min(this.totalPages, page)
    );
  }

  openCatalog(): void {
    this.router.navigate(['/instructor-catalog']);
  }

  openCourse(courseTitle: string): void {
    this.router.navigate(
      ['/instructor-course-curriculum'],
      {
        queryParams: {
          course: courseTitle
        }
      }
    );
  }

  deleteCourse(courseTitle: string): void {
    const confirmed = confirm(
      `Are you sure you want to delete "${courseTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    this.data.removeCourse(courseTitle);

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  toggleEmptyView(): void {
    this.emptyView = !this.emptyView;
    this.currentPage = 1;
  }

  get filteredCourses() {
    const value = this.query.trim().toLowerCase();

    return this.data.courses.filter((course) => {
      const matchesQuery =
        !value ||
        `${course.title} ${course.category}`
          .toLowerCase()
          .includes(value);

      const matchesStatus =
        this.status === 'All Status' ||
        course.status === this.status;

      const matchesTrack =
        this.track === 'All Tracks' ||
        course.category.includes(this.track);

      return (
        matchesQuery &&
        matchesStatus &&
        matchesTrack
      );
    });
  }

  get pagedCourses() {
    const start =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredCourses.slice(
      start,
      start + this.pageSize
    );
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.filteredCourses.length / this.pageSize
      )
    );
  }

  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  get pageStart(): number {
    return this.filteredCourses.length
      ? (this.currentPage - 1) * this.pageSize + 1
      : 0;
  }

  get pageEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredCourses.length
    );
  }
}