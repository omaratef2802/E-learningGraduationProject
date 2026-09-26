import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { CourseService, Course } from '../../../services/course';

type CourseSortOption = 'Most Popular' | 'Price: Low to High' | 'A-Z';

type QuickTag = 'All' | 'Beginner' | 'Advanced Architecture' | 'Next.js & Full-Stack';

@Component({
  selector: 'app-react-courses',
  standalone: true,
  imports: [FormsModule, RouterLink, HttpClientModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class ReactCourses implements OnInit {
  courses: Course[] = [];

  loading = false;
  errorMessage = '';

  searchText = '';

  selectedLevel = 'All Levels';
  selectedPrice = 'All';
  selectedRating = 'Any';
  selectedInstructor = 'All';

  selectedQuickTag: QuickTag = 'All';

  selectedSort: CourseSortOption = 'Most Popular';

  currentPage = 1;

  readonly pageSize = 6;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.errorMessage = '';

    this.courseService.getAllCourses().subscribe({
      next: (response: { data: any[]; }) => {

        this.courses = response.data.filter((course: { track: { slug: string; }; }) => {
          return course.track && course.track.slug && course.track.slug.toLowerCase() === 'react';
        });

        this.loading = false;
        this.currentPage = 1;
      },

      error: (error: any) => {
        console.error(error);

        this.loading = false;

        this.errorMessage = 'Unable to load courses. Please try again later.';
      },
    });
  }

  get filteredCourses(): Course[] {
    const search = this.searchText.toLowerCase().trim();

    const result = this.courses.filter((course) => {
      const instructorName =
        `${course.instructorId?.firstName || ''} ${course.instructorId?.lastName || ''}`.toLowerCase();

      const searchableText = `${course.title}
        ${course.description}
        ${course.level}
        ${instructorName}
        ${course.track?.title || ''}
        ${course.category?.name || ''}`.toLowerCase();

      const matchesSearch = !search || searchableText.includes(search);

      const matchesLevel =
        this.selectedLevel === 'All Levels' ||
        this.convertLevel(course.level) === this.selectedLevel;

      const matchesPrice =
        this.selectedPrice === 'All' ||
        (this.selectedPrice === 'Under $30' && course.price < 30) ||
        (this.selectedPrice === '$30 - $50' && course.price >= 30 && course.price <= 50) ||
        (this.selectedPrice === 'Over $50' && course.price > 50);

      const matchesRating =
        this.selectedRating === 'Any' ||
        (this.selectedRating === '4.5+' && course.rating >= 4.5) ||
        (this.selectedRating === '4.8+' && course.rating >= 4.8);

      const matchesInstructor =
        this.selectedInstructor === 'All' ||
        instructorName === this.selectedInstructor.toLowerCase();

      const matchesQuickTag =
        this.selectedQuickTag === 'All' ||
        (this.selectedQuickTag === 'Beginner' && course.level === 'beginner') ||
        (this.selectedQuickTag === 'Advanced Architecture' &&
          searchableText.includes('architecture')) ||
        (this.selectedQuickTag === 'Next.js & Full-Stack' && searchableText.includes('next.js'));

      return (
        matchesSearch &&
        matchesLevel &&
        matchesPrice &&
        matchesRating &&
        matchesInstructor &&
        matchesQuickTag
      );
    });

    return this.sortCourses(result);
  }

  get paginatedCourses(): Course[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredCourses.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const totalPages = Math.ceil(this.filteredCourses.length / this.pageSize);

    return Array.from(
      {
        length: Math.max(totalPages, 1),
      },
      (_, index) => index + 1,
    );
  }

  get totalCourses(): number {
    return this.courses.length;
  }

  get averageRating(): string {
    if (this.courses.length === 0) {
      return '0.0';
    }

    const total = this.courses.reduce((sum, course) => sum + (course.rating || 0), 0);

    return (total / this.courses.length).toFixed(1);
  }

  get averageDuration(): number {
    if (this.courses.length === 0) {
      return 0;
    }

    const total = this.courses.reduce((sum, course) => sum + (course.duration || 0), 0);

    return Math.round(total / this.courses.length);
  }

  get instructors(): string[] {
    const names: string[] = [];

    this.courses.forEach((course) => {
      if (course.instructorId) {
        const name = `${course.instructorId.firstName} ${course.instructorId.lastName}`;

        if (!names.includes(name)) {
          names.push(name);
        }
      }
    });

    return names;
  }

  convertLevel(level: string): string {
    if (level === 'beginner') {
      return 'Beginner';
    }

    if (level === 'intermediate') {
      return 'Intermediate';
    }

    if (level === 'advanced') {
      return 'Advanced';
    }

    return level;
  }

  getInstructorName(course: Course): string {
    if (!course.instructorId) {
      return 'Unknown Instructor';
    }

    return `${course.instructorId.firstName} ${course.instructorId.lastName}`;
  }

  getInstructorEmail(course: Course): string {
    if (!course.instructorId) {
      return '';
    }

    return course.instructorId.email;
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  courseSlug(course: Course): string {
    if (course.slug) {
      return course.slug;
    }

    return course.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  setPage(page: number): void {
    this.currentPage = Math.min(Math.max(page, 1), this.pageNumbers.length);
  }

  setQuickTag(tag: QuickTag): void {
    this.selectedQuickTag = tag;
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchText = '';

    this.selectedLevel = 'All Levels';
    this.selectedPrice = 'All';
    this.selectedRating = 'Any';
    this.selectedInstructor = 'All';

    this.selectedQuickTag = 'All';
    this.selectedSort = 'Most Popular';

    this.currentPage = 1;
  }

  clearFilters(): void {
    this.resetFilters();
  }

  private sortCourses(courses: Course[]): Course[] {
    switch (this.selectedSort) {
      case 'Most Popular':
        return [...courses].sort((a, b) => b.rating - a.rating);

      case 'Price: Low to High':
        return [...courses].sort((a, b) => a.price - b.price);

      case 'A-Z':
        return [...courses].sort((a, b) => a.title.localeCompare(b.title));

      default:
        return courses;
    }
  }
}
