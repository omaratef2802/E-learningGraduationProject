import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { DASHBOARD_CONFIG } from './course.config';
import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import { InstructorService } from '../../services/instructor.service';
import { InstructorDataService } from '../../services/instructor-data.service';

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
export class InstructorCourses implements OnInit {
  public data: any = { instructor: {}, courses: [] };

  private readonly router = inject(Router);

    protected readonly config = DASHBOARD_CONFIG;
  private readonly instructorService = inject(InstructorService);
  private readonly instructorData = inject(InstructorDataService);

  protected query = '';
  protected status = 'All Status';
  protected track = 'All Tracks';

  protected currentPage = 1;
  protected readonly pageSize = 4;

  protected emptyView = false;
  protected loadedCourses: any[] = [];
  protected loading = true;
  protected errorMessage = '';

  get isDashboardRoute(): boolean {
    return this.router.url.split('?')[0] === '/instructor-dashboard';
  }

  ngOnInit() {
    this.instructorData.getProfile().subscribe({
      next: (profile) => this.data.instructor = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        image: profile.img || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        role: profile.role || 'Instructor',
      },
      error: () => {},
    });
    this.instructorService.getMyCourses().subscribe({
      next: (res: any) => {
        const courses = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (courses.length > 0) {
          this.loadedCourses = courses.map((c: any) => ({
            id: c._id,
            title: c.title,
            category: c.category?.name || 'Uncategorized',
            status: c.status === 'published' ? 'Published' : c.status === 'in_review' ? 'In Review' : c.status === 'changes_required' ? 'Changes Required' : 'Draft',
            image: c.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80',
            price: `$${c.price || 0}`,
            students: c.enrolledStudents?.length || 0,
            rating: c.rating || '—',
            updated: new Date(c.updatedAt).toLocaleDateString()
          }));
          this.data.courses = this.loadedCourses;
          this.loading = false;
        } else {
          this.emptyView = true;
          this.data.courses = [];
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Unable to load instructor courses:', error);
        this.errorMessage = error.error?.message || 'Unable to load your courses right now.';
        this.loading = false;
      }
    });
  }


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

    this.instructorService.deleteCourse(courseId).subscribe({
      next: () => {
        this.loadedCourses = this.loadedCourses.filter(c => c.id !== courseId);
        
        if (this.loadedCourses.length === 0) {
          this.emptyView = true;
        }

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages || 1;
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete course. It may have purchase history.');
      }
    });
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

    return this.loadedCourses.filter((course) => {

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



