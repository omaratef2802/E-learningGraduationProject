import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  InstructorData,
  InstructorCourse,
  CourseStatus
} from '../../page/instructor-data';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-courses.html',
  styleUrl: './admin-courses.css',
})
export class AdminCourses implements OnInit {

  private readonly router = inject(Router);

  public readonly data =
    inject(InstructorData);

  courses: InstructorCourse[] = [];

  filteredCourses: InstructorCourse[] = [];

  searchText = '';

  selectedCategory = 'All';

  selectedStatus = 'All';

  selectedSort:
    | 'Latest'
    | 'Students'
    | 'Rating'
    | 'Price' = 'Latest';

  categories: string[] = [];

  loading = false;

  errorMessage = '';

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    try {
      this.loading = true;
      this.errorMessage = '';

      this.courses = [
        ...this.data.courses
      ];

      this.categories = [
        ...new Set(
          this.courses.map(
            course => course.category
          )
        )
      ];

      this.applyFilters();

      this.loading = false;
    } catch (error) {
      console.error(
        'Admin Courses Error:',
        error
      );

      this.errorMessage =
        'Unable to load courses.';

      this.loading = false;
    }
  }

  openCreateCourse(): void {
    this.router.navigate([
      '/admin-create-course'
    ]);
  }

  applyFilters(): void {
    const search =
      this.searchText
        .toLowerCase()
        .trim();

    this.filteredCourses =
      this.courses.filter(
        course => {

          const matchesSearch =
            !search ||
            course.title
              .toLowerCase()
              .includes(search) ||
            course.category
              .toLowerCase()
              .includes(search) ||
            (course.instructorName || '')
              .toLowerCase()
              .includes(search);

          const matchesCategory =
            this.selectedCategory === 'All' ||
            course.category ===
              this.selectedCategory;

          const matchesStatus =
            this.selectedStatus === 'All' ||
            course.status ===
              this.selectedStatus;

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
          );
        }
      );

    this.sortCourses();
  }

  sortCourses(): void {
    const courses =
      [...this.filteredCourses];

    switch (this.selectedSort) {

      case 'Students':
        courses.sort(
          (a, b) =>
            this.toNumber(b.students) -
            this.toNumber(a.students)
        );
        break;

      case 'Rating':
        courses.sort(
          (a, b) =>
            this.toNumber(b.rating) -
            this.toNumber(a.rating)
        );
        break;

      case 'Price':
        courses.sort(
          (a, b) =>
            this.toPrice(b.price) -
            this.toPrice(a.price)
        );
        break;

      case 'Latest':
      default:
        courses.sort(
          (a, b) =>
            this.getUpdateWeight(b.updated) -
            this.getUpdateWeight(a.updated)
        );
        break;
    }

    this.filteredCourses = courses;
  }

  onSortChange(): void {
    this.sortCourses();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'All';
    this.selectedStatus = 'All';
    this.selectedSort = 'Latest';

    this.applyFilters();
  }

  getTotalCourses(): number {
    return this.courses.length;
  }

  getPublishedCourses(): number {
    return this.courses.filter(
      course =>
        course.status === 'Published'
    ).length;
  }

  getDraftCourses(): number {
    return this.courses.filter(
      course =>
        course.status === 'Draft'
    ).length;
  }

  getAssignedCourses(): number {
    return this.courses.filter(
      course =>
        course.status === 'Assigned'
    ).length;
  }

  getInReviewCourses(): number {
    return this.courses.filter(
      course =>
        course.status === 'In Review'
    ).length;
  }

  getTotalStudents(): number {
    return this.courses.reduce(
      (total, course) =>
        total +
        this.toNumber(course.students),
      0
    );
  }

  getAverageRating(): string {
    const ratedCourses =
      this.courses.filter(
        course =>
          course.rating !== '—' &&
          this.toNumber(course.rating) > 0
      );

    if (!ratedCourses.length) {
      return '0.0';
    }

    const total =
      ratedCourses.reduce(
        (sum, course) =>
          sum +
          this.toNumber(course.rating),
        0
      );

    return (
      total /
      ratedCourses.length
    ).toFixed(1);
  }

  getStatusClass(
    status: CourseStatus
  ): string {
    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  getCourseInstructor(
    course: InstructorCourse
  ): string {
    return course.instructorName ||
      'Unassigned';
  }

  toNumber(
    value: string
  ): number {
    const number =
      parseFloat(
        value.replace(
          /[^0-9.]/g,
          ''
        )
      );

    return Number.isNaN(number)
      ? 0
      : number;
  }

  toPrice(
    value: string
  ): number {
    return this.toNumber(value);
  }

  getUpdateWeight(
    value: string
  ): number {

    const text =
      value
        .toLowerCase()
        .trim();

    if (text === 'just now') {
      return 100000;
    }

    if (text.includes('min')) {
      return 90000;
    }

    if (text.includes('hour')) {
      return 80000;
    }

    if (text.includes('day')) {
      const days =
        this.toNumber(text);

      return 70000 - days;
    }

    if (text.includes('week')) {
      const weeks =
        this.toNumber(text);

      return 60000 - weeks;
    }

    if (text.includes('month')) {
      const months =
        this.toNumber(text);

      return 50000 - months;
    }

    return 0;
  }
}