import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AdminService } from '../../services/admin.service';
import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

export type CourseStatus = 'Published' | 'Draft' | 'In Review' | 'Assigned' | string;

export interface InstructorCourse {
  id: string;
  title: string;
  category: string;
  instructorName?: string;
  students: string;
  rating: string;
  price: string;
  status: CourseStatus;
  updated: string;
  thumbnail?: string;
}

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
  private adminService = inject(AdminService);

  courses: InstructorCourse[] = [];
  filteredCourses: InstructorCourse[] = [];

  searchText = '';
  selectedCategory = 'All';
  selectedStatus = 'All';
  selectedSort: 'Latest' | 'Students' | 'Rating' | 'Price' = 'Latest';

  categories: string[] = [];

  loading = false;
  errorMessage = '';
  successMessage = '';

  showRejectModal = false;
  rejectTargetCourse: InstructorCourse | null = null;
  rejectMessage = '';

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminService.getCourses().subscribe({
       next: (res: any) => {
          const fetched = res.data || res || [];
          this.courses = fetched.map((c: any) => ({
             id: c._id || c.id,
             title: c.title || c.name,
             category: c.category?.name || c.category || 'Uncategorized',
             instructorName: c.instructor?.name || c.instructor?.username || 'Unknown',
             students: String(c.enrolledStudents?.length || 0),
             rating: String(c.rating || '0'),
             price: String(c.price || '0'),
             status: c.status || 'Published',
             updated: c.updatedAt || 'just now'
          }));

          this.categories = [...new Set(this.courses.map(course => course.category))];
          this.applyFilters();
          this.loading = false;
       },
       error: (err) => {
          console.error('Admin Courses Error:', err);
          this.errorMessage = 'Unable to load courses.';
          this.loading = false;
       }
    });
  }

  openCreateCourse(): void {
    this.router.navigate(['/admin-create-course']);
  }

  applyFilters(): void {
    const search = this.searchText.toLowerCase().trim();

    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch = !search ||
        course.title.toLowerCase().includes(search) ||
        course.category.toLowerCase().includes(search) ||
        (course.instructorName || '').toLowerCase().includes(search);

      const matchesCategory = this.selectedCategory === 'All' || course.category === this.selectedCategory;
      const matchesStatus = this.selectedStatus === 'All' || course.status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    this.sortCourses();
  }

  sortCourses(): void {
    const courses = [...this.filteredCourses];
    switch (this.selectedSort) {
      case 'Students':
        courses.sort((a, b) => this.toNumber(b.students) - this.toNumber(a.students));
        break;
      case 'Rating':
        courses.sort((a, b) => this.toNumber(b.rating) - this.toNumber(a.rating));
        break;
      case 'Price':
        courses.sort((a, b) => this.toPrice(b.price) - this.toPrice(a.price));
        break;
      case 'Latest':
      default:
        courses.sort((a, b) => this.getUpdateWeight(b.updated) - this.getUpdateWeight(a.updated));
        break;
    }
    this.filteredCourses = courses;
  }

  onSortChange(): void { this.sortCourses(); }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'All';
    this.selectedStatus = 'All';
    this.selectedSort = 'Latest';
    this.applyFilters();
  }

  getTotalCourses(): number { return this.courses.length; }
  getPublishedCourses(): number { return this.courses.filter(c => c.status === 'Published').length; }
  getDraftCourses(): number { return this.courses.filter(c => c.status === 'Draft').length; }
  getAssignedCourses(): number { return this.courses.filter(c => c.status === 'Assigned').length; }
  getInReviewCourses(): number { return this.courses.filter(c => c.status === 'In Review').length; }
  getTotalStudents(): number { return this.courses.reduce((total, course) => total + this.toNumber(course.students), 0); }

  getAverageRating(): string {
    const ratedCourses = this.courses.filter(c => c.rating !== '—' && this.toNumber(c.rating) > 0);
    if (!ratedCourses.length) return '0.0';
    const total = ratedCourses.reduce((sum, course) => sum + this.toNumber(course.rating), 0);
    return (total / ratedCourses.length).toFixed(1);
  }

  getStatusClass(status: CourseStatus): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getCourseInstructor(course: InstructorCourse): string {
    return course.instructorName || 'Unassigned';
  }

  toNumber(value: string): number {
    const number = parseFloat(value.replace(/[^0-9.]/g, ''));
    return Number.isNaN(number) ? 0 : number;
  }

  toPrice(value: string): number { return this.toNumber(value); }

  getUpdateWeight(value: string): number {
    const text = value.toLowerCase().trim();
    if (text === 'just now') return 100000;
    if (text.includes('min')) return 90000;
    if (text.includes('hour')) return 80000;
    if (text.includes('day')) return 70000 - this.toNumber(text);
    if (text.includes('week')) return 60000 - this.toNumber(text);
    if (text.includes('month')) return 50000 - this.toNumber(text);
    return 0; // Fallback for ISO dates or other text
  }

  approveCourse(course: InstructorCourse): void {
    // Requires an endpoint to update course status
    if (course.status !== 'In Review') return;
    this.adminService.updateCourseStatus(course.id, 'published').subscribe({
       next: () => {
         this.successMessage = `"${course.title}" approved and published. Instructor notified.`;
         course.status = 'Published';
         setTimeout(() => { this.successMessage = ''; }, 4000);
       },
       error: (err) => console.error(err)
    });
  }

  openRejectModal(course: InstructorCourse): void {
    if (course.status !== 'In Review') return;
    this.rejectTargetCourse = course;
    this.rejectMessage = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.rejectTargetCourse = null;
    this.rejectMessage = '';
  }

  confirmRejectCourse(): void {
    if (!this.rejectTargetCourse) return;
    // Send feedback via API
    this.adminService.updateCourseStatus(this.rejectTargetCourse.id, 'draft').subscribe({
       next: () => {
         this.successMessage = `"${this.rejectTargetCourse!.title}" sent back for changes. Instructor notified.`;
         this.closeRejectModal();
       },
       error: (err) => console.error(err)
    });
    this.loadCourses();
    setTimeout(() => { this.successMessage = ''; }, 4000);
  }

  deleteCourse(course: InstructorCourse): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to delete "${course.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
         this.adminService.deleteCourse(course.id).subscribe({
            next: () => {
              this.successMessage = `Course "${course.title}" deleted successfully.`;
              this.loadCourses();
              setTimeout(() => { this.successMessage = ''; }, 4000);
            },
            error: (err) => {
              console.error(err);
              this.errorMessage = 'Unable to delete course';
            }
         });
      }
    });
  }
}