import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist';
import { CommonModule } from '@angular/common';

interface Instructor {
  _id: string;
  firstName: string;
  lastName: string;
  img?: string | null;
}

interface Course {
  _id: string;
  title: string;
  description?: string;
  slug?: string;
  image?: string;
  price: number;
  level?: string;
  rating?: number;
  duration?: number;
  instructorId?: Instructor | null;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
  imports: [RouterLink, CommonModule],
})
export class WishlistComponent implements OnInit {
  private readonly wishlistService = inject(WishlistService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  courses: Course[] = [];
  displayedCourses: Course[] = [];
  searchQuery = '';
  errorMessage = '';
  successMessage = '';
  loading = true;
  removingId = '';

  ngOnInit(): void {
    this.getWishlist();
  }

  getWishlist(): void {
    this.loading = true;
    this.errorMessage = '';

    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        this.courses = Array.isArray(response?.courses) ? response.courses : [];
        this.displayedCourses = [...this.courses];
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        this.courses = [];
        this.displayedCourses = [];
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to load wishlist';
        this.changeDetector.detectChanges();
      },
    });
  }

  updateSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.searchCourses();
  }

  searchCourses(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.displayedCourses = [...this.courses];
      return;
    }

    this.displayedCourses = this.courses.filter((course) => {
      const instructorName = this.getInstructorName(course).toLowerCase();
      return (
        course.title?.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        instructorName.includes(query)
      );
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.displayedCourses = [...this.courses];
  }

  removeFromWishlist(courseId: string): void {
    if (this.removingId) return;
    this.removingId = courseId;
    this.errorMessage = '';

    this.wishlistService.removeFromWishlist(courseId).subscribe({
      next: () => {
        this.courses = this.courses.filter((course) => course._id !== courseId);
        this.searchCourses();
        this.removingId = '';
        this.showSuccess('Course removed from wishlist');
        this.changeDetector.detectChanges();
      },
      error: (error) => {
        this.removingId = '';
        this.errorMessage = error.error?.message || 'Failed to remove course from wishlist';
        this.changeDetector.detectChanges();
      },
    });
  }

  openCourse(courseId: string): void {
    this.router.navigate(['/course', courseId]);
  }

  getInstructorName(course: Course): string {
    if (!course.instructorId) return 'Lead Instructor';
    return `${course.instructorId.firstName ?? ''} ${course.instructorId.lastName ?? ''}`.trim() || 'Lead Instructor';
  }

  getInstructorInitial(course: Course): string {
    return this.getInstructorName(course).charAt(0).toUpperCase();
  }

  getDuration(course: Course): string {
    return course.duration ? `${course.duration}h` : 'Self-paced';
  }

  getLevel(course: Course): string {
    if (!course.level) return 'All Levels';
    return course.level.charAt(0).toUpperCase() + course.level.slice(1);
  }

  get activeCoursesCount(): number {
    return this.courses.length;
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
      this.changeDetector.detectChanges();
    }, 2200);
  }
}
