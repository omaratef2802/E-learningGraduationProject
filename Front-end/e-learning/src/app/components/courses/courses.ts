import { ChangeDetectorRef, Component, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { COURSES_CONFIG, CourseItem } from './courses.config';
import { InstructorService } from '../../services/instructor.service';
import { WishlistService } from '../../services/wishlist';
import { CartService } from '../../services/cart';
import { CommonModule } from '@angular/common';
import { Course, PopulatedUser } from '../../mock-types';
import { timeout } from 'rxjs';

/** Extracts a display name from an instructor that may be raw or populated. */
const instructorName = (value: Course['instructorId']): string => {
  if (value && typeof value === 'object') {
    const user = value as PopulatedUser;
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  }
  return '';
};

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses implements OnChanges, OnDestroy, OnInit {
  private readonly router = inject(Router);
  protected readonly config = COURSES_CONFIG;
  private readonly backend = inject(InstructorService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  // The app runs without zone.js, so async callbacks have to schedule change
  // detection themselves or the grid stays empty after the response arrives.
  private readonly changeDetector = inject(ChangeDetectorRef);

  @Input() limit?: number;
  @Input() searchQuery?: string;
  @Input() categoryId?: string;
  @Input() trackId?: string;
  @Input() instructorId?: string;
  @Input() showHeading = true;

  public loadedCourses: CourseItem[] = [];
  public wishlistToast = '';
  public wishlistToastType: 'success' | 'error' | 'pending' = 'success';
  public cartToast = '';
  public cartToastType: 'success' | 'error' | 'pending' = 'success';
  private wishlistToastTimer?: ReturnType<typeof setTimeout>;
  private cartToastTimer?: ReturnType<typeof setTimeout>;
  private readonly wishlistChangesInFlight = new Set<string>();
  private readonly cartChangesInFlight = new Set<string>();

  ngOnInit() {
    this.fetchCourses();
  }

  ngOnDestroy(): void {
    if (this.wishlistToastTimer) clearTimeout(this.wishlistToastTimer);
    if (this.cartToastTimer) clearTimeout(this.cartToastTimer);
  }

  /**
   * When the parent supplies or changes a category/track id the grid has to
   * refetch, because `ngOnInit` runs before the inputs are bound.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['categoryId'] && !changes['categoryId'].firstChange) ||
        (changes['trackId'] && !changes['trackId'].firstChange) ||
        (changes['instructorId'] && !changes['instructorId'].firstChange)) {
      this.fetchCourses();
    }
  }

  fetchCourses() {
    let apiCall = this.backend.getAllCourses();

    if (this.instructorId) {
      apiCall = this.backend.getCoursesByInstructor(this.instructorId);
    } else if (this.trackId) {
      apiCall = this.backend.getCoursesByTrack(this.trackId);
    } else if (this.categoryId) {
      apiCall = this.backend.getCoursesByCategory(this.categoryId);
    }

    apiCall.subscribe({
      next: (backendCourses) => {
        // The service already unwraps the `{ data: [...] }` response.
        this.mapCourses(backendCourses);
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        this.mapCourses([]);
      },
    });
  }

  private mapCourses(rawCourses: Course[]) {
    // With no rows in the database there is nothing to render, so the grid is
    // left empty rather than filled with placeholder courses.
    let list: CourseItem[] = rawCourses.map((c) => ({
      id: c._id,
      image:
        c.image ||
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
      tag:
        (typeof c.category === 'object' && c.category?.name) ||
        (typeof c.track === 'object' && c.track?.title) ||
        'Course',
      rating: c.rating ? String(c.rating) : 'No rating',
      reviews: c.rating ? `${c.rating} rating` : 'No ratings',
      title: c.title,
      instructor: instructorName(c.instructorId) || 'Lead Instructor',
      level: c.level ? `${c.level.charAt(0).toUpperCase()}${c.level.slice(1)}` : 'All Levels',
      duration: `${c.duration}h`,
      price: `$${c.price}`,
      query: c.title,
      inWishlist: false,
      inCart: false,
    }));

    this.loadedCourses = list;
    this.changeDetector.detectChanges();
    this.checkWishlist();
    this.checkCart();
  }

  private checkCart(): void {
    if (this.currentUserRole() !== 'student') return;
    this.cartService.getCart().subscribe({
      next: (response: any) => {
        const cart = response?.cart ?? response?.data?.cart ?? response;
        const ids = new Set<string>((cart?.courses ?? []).map((item: any) => String(
          item?.courseId?._id ?? item?.courseId ?? item?._id ?? ''
        )));
        this.loadedCourses.forEach((course) => {
          if (course.id && !this.cartChangesInFlight.has(course.id)) {
            course.inCart = ids.has(String(course.id));
          }
        });
        this.changeDetector.detectChanges();
      },
      error: () => {},
    });
  }

  private checkWishlist() {
    if (this.currentUserRole() === 'student') {
      this.wishlistService.getWishlist().subscribe({
        next: (res: any) => {
          const wishlist = Array.isArray(res?.courses)
            ? res.courses
            : Array.isArray(res?.data?.courses)
              ? res.data.courses
              : [];
          const wishlistIds = new Set<string>(wishlist.map((item: any) => String(
            item?._id ?? item?.course?._id ?? item?.courseId?._id ?? item
          )));
          this.loadedCourses.forEach(c => {
            if (c.id && !this.wishlistChangesInFlight.has(c.id)) {
              c.inWishlist = wishlistIds.has(String(c.id));
            }
          });
          this.changeDetector.detectChanges();
        },
        error: () => {}
      });
      // Optionally check cart here too, but for now we just add
    }
  }

  toggleWishlist(course: CourseItem, event: Event) {
    event.stopPropagation();
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.currentUserRole() !== 'student') {
      this.showWishlistToast('Wishlist is available to student accounts.', 'error');
      return;
    }
    if (!course.id || course.wishlistBusy) return;

    const wasInWishlist = !!course.inWishlist;
    const shouldAdd = !wasInWishlist;
    course.inWishlist = shouldAdd;
    course.wishlistBusy = true;
    this.wishlistChangesInFlight.add(course.id);
    this.showWishlistToast(shouldAdd ? 'Adding to your wishlist…' : 'Removing from your wishlist…', 'pending');
    this.changeDetector.detectChanges();

    const request = shouldAdd
      ? this.wishlistService.addToWishlist(course.id)
      : this.wishlistService.removeFromWishlist(course.id);

    request.pipe(timeout(15000)).subscribe({
      next: () => {
        course.wishlistBusy = false;
        this.wishlistChangesInFlight.delete(course.id!);
        this.showWishlistToast(shouldAdd ? 'Added to your wishlist.' : 'Removed from your wishlist.');
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        course.inWishlist = wasInWishlist;
        course.wishlistBusy = false;
        this.wishlistChangesInFlight.delete(course.id!);
        const serverMessage = err.error?.message || '';
        if (shouldAdd && err.status === 400 && serverMessage.toLowerCase().includes('already') && serverMessage.toLowerCase().includes('wishlist')) {
          course.inWishlist = true;
          this.showWishlistToast('This course is already in your wishlist.');
        } else {
          const message = err.name === 'TimeoutError'
            ? 'The server did not respond in time. Please try again.'
            : serverMessage || (shouldAdd
              ? 'Could not add this course to your wishlist.'
              : 'Could not remove this course from your wishlist.');
          this.showWishlistToast(message, 'error');
        }
        this.changeDetector.detectChanges();
      },
    });
  }

  private showWishlistToast(message: string, type: 'success' | 'error' | 'pending' = 'success'): void {
    if (this.wishlistToastTimer) clearTimeout(this.wishlistToastTimer);
    this.wishlistToast = message;
    this.wishlistToastType = type;
    this.changeDetector.detectChanges();
    if (type !== 'pending') {
      this.wishlistToastTimer = setTimeout(() => {
        this.wishlistToast = '';
        this.changeDetector.detectChanges();
      }, 2800);
    }
  }

  private currentUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload)).role ?? null;
    } catch {
      return null;
    }
  }

  addToCart(course: CourseItem, event: Event) {
    event.stopPropagation();
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.currentUserRole() !== 'student') {
      this.showCartToast('The cart is available to student accounts.', 'error');
      return;
    }
    if (!course.id) return;
    if (course.cartBusy) return;
    if (course.inCart) {
      this.showCartToast('This course is already in your cart.');
      return;
    }

    const numericPrice = parseFloat(course.price.replace(/[^0-9.]/g, '')) || 49.99;
    course.inCart = true;
    course.cartBusy = true;
    this.cartChangesInFlight.add(course.id);
    this.showCartToast('Adding course to your cart…', 'pending');
    this.changeDetector.detectChanges();

    this.cartService.addToCart(course.id, numericPrice).subscribe({
      next: () => {
        course.cartBusy = false;
        this.cartChangesInFlight.delete(course.id!);
        this.showCartToast('Course added to your cart.');
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        course.cartBusy = false;
        this.cartChangesInFlight.delete(course.id!);
        const serverMessage = err.error?.message || '';
        if (err.status === 400 && serverMessage.toLowerCase().includes('already in cart')) {
          course.inCart = true;
          this.showCartToast('This course is already in your cart.');
        } else {
          course.inCart = false;
          this.showCartToast(serverMessage || 'Could not add this course to your cart.', 'error');
        }
        this.changeDetector.detectChanges();
      }
    });
  }

  private showCartToast(message: string, type: 'success' | 'error' | 'pending' = 'success'): void {
    if (this.cartToastTimer) clearTimeout(this.cartToastTimer);
    this.cartToast = message;
    this.cartToastType = type;
    this.changeDetector.detectChanges();
    if (type !== 'pending') {
      this.cartToastTimer = setTimeout(() => {
        this.cartToast = '';
        this.changeDetector.detectChanges();
      }, 2800);
    }
  }

  get coursesList(): CourseItem[] {
    // Only database rows are rendered; no placeholder items are injected.
    let list = this.loadedCourses;

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) || 
        (c.tag && c.tag.toLowerCase().includes(q)) ||
        (c.instructor && c.instructor.toLowerCase().includes(q))
      );
    }
    
    if (this.limit && this.limit > 0) {
      return list.slice(0, this.limit);
    }
    return list;
  }

  openCourse(course: CourseItem): void {
    if (course.id) {
      this.router.navigate(['/course', course.id]);
    } else {
      const slug = course.query.toLowerCase().replace(/\s+/g, '-');
      this.router.navigate(['/course', slug]);
    }
  }
}


