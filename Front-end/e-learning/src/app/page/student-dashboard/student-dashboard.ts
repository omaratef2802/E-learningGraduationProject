import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { StudentEnrollment, StudentLearningService } from '../../services/student-learning.service';
import { CartService } from '../../services/cart';
import { StudentSidebar } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StudentSidebar],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboard implements OnInit {
  private readonly learning = inject(StudentLearningService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  enrollments: StudentEnrollment[] = [];
  isLoading = true;
  errorMessage = '';
  readonly studentName = this.readStudentName();
  readonly cartCount = this.cartService.itemCount;
  readonly cartTotal = () => this.cartService.cart()?.totalPrice ?? 0;

  ngOnInit(): void {
    this.cartService.getCart().subscribe({ error: () => this.cartService.clearState() });
    this.learning.getMyEnrollments().subscribe({
      next: (enrollments) => {
        this.enrollments = enrollments.filter((item) => item.courseId);
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.status === 401 || error.status === 403
          ? 'Please sign in with a student account to view your learning.'
          : 'We could not load your courses right now.';
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  get inProgressCount(): number {
    return this.enrollments.filter((item) => item.status !== 'completed' && item.progress < 100).length;
  }

  get completedCount(): number {
    return this.enrollments.filter((item) => item.status === 'completed' || item.progress >= 100).length;
  }

  get averageProgress(): number {
    if (!this.enrollments.length) return 0;
    return Math.round(this.enrollments.reduce((sum, item) => sum + (item.progress || 0), 0) / this.enrollments.length);
  }

  get visibleEnrollments(): StudentEnrollment[] {
    return this.router.url.split('?')[0] === '/learning'
      ? this.enrollments
      : this.enrollments.slice(0, 3);
  }

  get showViewAll(): boolean {
    return this.enrollments.length > 3 && this.router.url.split('?')[0] !== '/learning';
  }

  continueCourse(enrollment: StudentEnrollment): void {
    if (enrollment.courseId?._id) {
      this.router.navigate(['/learn', enrollment.courseId._id]);
    }
  }

  instructorName(enrollment: StudentEnrollment): string {
    const instructor = enrollment.courseId?.instructorId;
    return instructor ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || 'PathwayEd instructor' : 'PathwayEd instructor';
  }

  private readStudentName(): string {
    try {
      const token = localStorage.getItem('token');
      const encoded = token?.split('.')[1];
      if (encoded) {
        const bytes = Uint8Array.from(atob(encoded.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0));
        const payload = JSON.parse(new TextDecoder().decode(bytes));
        return payload.fullname?.trim().split(/\s+/)[0] || 'Student';
      }
    } catch {
      // Use the generic welcome when no readable profile name is available.
    }
    return 'Student';
  }
}
