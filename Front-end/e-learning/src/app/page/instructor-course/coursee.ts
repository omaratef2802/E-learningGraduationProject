import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { DASHBOARD_CONFIG } from './course.config';
import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import { InstructorData } from '../instructor-data';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    InstructorSidebar
  ],
  templateUrl: './course.html',
  styleUrl: './course.css'
})
export class InstructorCourses {

  private readonly router = inject(Router);

  protected readonly data = inject(InstructorData);
  protected readonly config = DASHBOARD_CONFIG;

  protected query = '';
  protected status = 'All Status';
  protected track = 'All Tracks';

  protected currentPage = 1;
  protected readonly pageSize = 4;

  protected emptyView = false;


  /* =========================
     PAGINATION
  ========================= */

  setPage(page: number): void {
    this.currentPage = Math.max(
      1,
      Math.min(this.totalPages, page)
    );
  }


  /* =========================
     CATALOG
  ========================= */

  openCatalog(): void {
    this.router.navigate(['/instructor-catalog']);
  }


  /* =========================
     COURSE ACTIONS
  ========================= */

  openCourse(courseId: string, courseTitle: string): void {
    this.router.navigate(
      ['/instructor-course-curriculum'],
      {
        queryParams: {
          course: courseTitle,
          courseId: courseId
        }
      }
    );
  }


  deleteCourse(courseId: string, courseTitle: string): void {

    const confirmed = confirm(
      `Are you sure you want to delete "${courseTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    this.data.removeCourse(courseId);

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }


  /* =========================
     EMPTY VIEW
  ========================= */

  toggleEmptyView(): void {
    this.emptyView = !this.emptyView;
    this.currentPage = 1;
  }


  /* =========================
     FILTERS
  ========================= */

  get filteredCourses() {

    const value = this.query
      .trim()
      .toLowerCase();

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


  /* =========================
     PAGED COURSES
  ========================= */

  get pagedCourses() {

    const start =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredCourses.slice(
      start,
      start + this.pageSize
    );
  }


  /* =========================
     TOTAL PAGES
  ========================= */

  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(
        this.filteredCourses.length / this.pageSize
      )
    );
  }


  /* =========================
     PAGE NUMBERS
  ========================= */

  get pageNumbers(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }


  /* =========================
     PAGE START
  ========================= */

  get pageStart(): number {

    return this.filteredCourses.length
      ? (this.currentPage - 1) * this.pageSize + 1
      : 0;
  }


  /* =========================
     PAGE END
  ========================= */

  get pageEnd(): number {

    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredCourses.length
    );
  }

}