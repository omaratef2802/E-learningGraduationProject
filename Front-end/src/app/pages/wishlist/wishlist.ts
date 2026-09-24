import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../services/wishlist';
import { RouterLink } from '@angular/router';

interface Instructor {
  _id: string;
  firstName: string;
  lastName: string;
  img: string | null;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  slug: string;
  image: string;
  price: number;
  level: string;
  rating: number;
  duration: {
    value: number;
    unit: string;
  };
  instructorId: Instructor;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
  imports: [RouterLink],
})
export class WishlistComponent implements OnInit {
  courses: Course[] = [];
  displayedCourses: Course[] = [];

  searchQuery: string = '';

  errorMessage: string = '';
  successMessage: string = '';

  constructor(private wishlistService: WishlistService) {}

  ngOnInit(): void {
    this.getWishlist();
  }

  getWishlist(): void {
    this.errorMessage = '';

    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        this.courses = response?.courses || [];
        this.displayedCourses = [...this.courses];
      },

      error: (error) => {
        this.courses = [];
        this.displayedCourses = [];

        if (error.status !== 404) {
          this.errorMessage = error.error?.message || 'Failed to load wishlist';
        }
      },
    });
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchQuery = input.value;
    this.searchCourses();
  }

  searchCourses(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.displayedCourses = [...this.courses];
      return;
    }

    this.displayedCourses = this.courses.filter((course) => {
      const instructorName = course.instructorId
        ? course.instructorId.firstName + ' ' + course.instructorId.lastName
        : '';

      return (
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        instructorName.toLowerCase().includes(query)
      );
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.displayedCourses = [...this.courses];
  }

  removeFromWishlist(courseId: string): void {
    this.errorMessage = '';

    this.wishlistService.removeFromWishlist(courseId).subscribe({
      next: () => {
        this.courses = this.courses.filter((course) => course._id !== courseId);

        this.searchCourses();

        this.successMessage = 'Course removed from wishlist';

        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      },

      error: (error) => {
        console.log('Remove wishlist error:', error);

        this.errorMessage = error.error?.message || 'Failed to remove course from wishlist';

        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      },
    });
  }

  getInstructorName(course: Course): string {
    if (!course.instructorId) {
      return 'Unknown Instructor';
    }

    return course.instructorId.firstName + ' ' + course.instructorId.lastName;
  }

  getDuration(course: Course): string {
    if (!course.duration) {
      return '';
    }

    return course.duration.value + ' ' + course.duration.unit;
  }

  get activeCoursesCount(): number {
    return this.courses.length;
  }
}
