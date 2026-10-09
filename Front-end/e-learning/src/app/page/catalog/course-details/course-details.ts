import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InstructorService } from '../../../services/instructor.service';
import { WishlistService } from '../../../services/wishlist';
import { CartService } from '../../../services/cart';
import { PaymentService } from '../../../services/payment';
import { StudentLearningService } from '../../../services/student-learning.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly instructorService = inject(InstructorService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly paymentService = inject(PaymentService);
  private readonly studentLearningService = inject(StudentLearningService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  courseId = '';
  courseData: any = null;
  errorMessage = '';
  loading = true;
  isWishlist = false;
  wishlistBusy = false;
  cartBusy = false;
  inCart = false;
  enrolled = false;
  courseSections: any[] = [];
  outlineLoading = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer?: ReturnType<typeof setTimeout>;
  private paymentStatusTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    // The route is /course/:courseId, so read courseId (not slug).
    this.courseId = this.activatedRoute.snapshot.paramMap.get('courseId') ?? '';
    if (!this.courseId) {
      this.loading = false;
      this.errorMessage = 'Course id is missing.';
      return;
    }
    const paymentId = this.activatedRoute.snapshot.queryParamMap.get('paymentId');
    if (paymentId) this.watchPayment(paymentId);
    if (this.activatedRoute.snapshot.queryParamMap.get('payment') === 'success') {
      this.enrolled = true;
      this.showToast('Demo payment completed. Course content is unlocked.');
    }
    this.fetchCourse();
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.paymentStatusTimer) clearInterval(this.paymentStatusTimer);
  }

  fetchCourse(): void {
    this.loading = true;
    this.instructorService.getCourse(this.courseId).subscribe({
      next: (course) => {
        this.courseData = course;
        this.loading = false;
        this.changeDetector.detectChanges();
        this.loadStudentState();
        this.loadCourseOutline();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Failed to load course details';
        this.changeDetector.detectChanges();
        console.error('Course details error:', err);
      },
    });
  }

  private loadCourseOutline(): void {
    this.outlineLoading = true;
    this.instructorService.getCourseOutline(this.courseId).subscribe({
      next: (response) => {
        this.courseSections = response?.data ?? [];
        this.outlineLoading = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.courseSections = [];
        this.outlineLoading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  private watchPayment(paymentId: string): void {
    const check = () => this.paymentService.getPaymentStatus(paymentId).subscribe({
      next: (response) => {
        const status = response?.payment?.status;
        if (status === 'success') {
          if (this.paymentStatusTimer) clearInterval(this.paymentStatusTimer);
          this.enrolled = true;
          this.loadStudentState();
          this.showToast('Payment confirmed. Course content is unlocked.');
          this.changeDetector.detectChanges();
        } else if (status === 'failed') {
          if (this.paymentStatusTimer) clearInterval(this.paymentStatusTimer);
          this.showToast('Payment was not completed.', 'error');
        }
      },
      error: () => {},
    });
    check();
    this.paymentStatusTimer = setInterval(check, 3000);
  }

  private loadStudentState(): void {
    if (!this.isStudent()) return;

    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        const courses = response?.courses ?? [];
        this.isWishlist = courses.some((course: any) => String(course?._id) === String(this.courseId));
        this.changeDetector.detectChanges();
      },
      error: () => {},
    });

    this.cartService.getCart().subscribe({
      next: (response) => {
        const courses = response?.cart?.courses ?? response?.courses ?? [];
        this.inCart = courses.some((item: any) => String(item?.courseId?._id ?? item?.courseId) === String(this.courseId));
        this.changeDetector.detectChanges();
      },
      error: () => {},
    });

    this.studentLearningService.getMyEnrollments().subscribe({
      next: (enrollments) => {
        this.enrolled = enrollments.some((entry) => String(entry.courseId?._id) === String(this.courseId));
        this.changeDetector.detectChanges();
      },
      error: () => {},
    });
  }

  toggleWishlist(): void {
    if (!this.isStudent()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.wishlistBusy || !this.courseId) return;

    const wasSaved = this.isWishlist;
    this.isWishlist = !wasSaved;
    this.wishlistBusy = true;
    this.changeDetector.detectChanges();

    const request = wasSaved
      ? this.wishlistService.removeFromWishlist(this.courseId)
      : this.wishlistService.addToWishlist(this.courseId);

    request.subscribe({
      next: () => {
        this.wishlistBusy = false;
        this.showToast(wasSaved ? 'Removed from your wishlist.' : 'Added to your wishlist.');
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        this.isWishlist = wasSaved;
        this.wishlistBusy = false;
        this.showToast(err.error?.message || 'Could not update your wishlist.', 'error');
        this.changeDetector.detectChanges();
      },
    });
  }

  addToCart(): void {
    if (!this.isStudent()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.cartBusy || this.inCart || !this.courseId) return;

    this.cartBusy = true;
    this.cartService.addToCart(this.courseId, Number(this.courseData?.price) || 0).subscribe({
      next: () => {
        this.cartBusy = false;
        this.inCart = true;
        this.showToast('Course added to your cart.');
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        this.cartBusy = false;
        this.showToast(err.error?.message || 'Could not add this course to your cart.', 'error');
        this.changeDetector.detectChanges();
      },
    });
  }

  enrollNow(): void {
    if (!this.isStudent()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.enrolled) {
      this.router.navigate(['/learn', this.courseId]);
      return;
    }
    if (this.cartBusy || !this.courseId) return;
    this.cartBusy = true;
    this.paymentService.buyNow(this.courseId).subscribe({
      next: (response) => {
        const orderId = response?.order?._id;
        if (!orderId) {
          this.cartBusy = false;
          this.showToast('Could not create your order.', 'error');
          return;
        }
        this.paymentService.createPayment(orderId).subscribe({
          next: (paymentResponse) => {
            this.cartBusy = false;
            if (paymentResponse?.demo && paymentResponse?.payment?.status === 'success') {
              this.enrolled = true;
              this.loadCourseOutline();
              this.loadStudentState();
              this.router.navigate(['/course', this.courseId], { queryParams: { payment: 'success' } });
              this.showToast('Demo payment completed. Course content is unlocked.');
              return;
            }
            const checkoutUrl = paymentResponse?.checkoutUrl;
            if (!checkoutUrl) {
              this.showToast('Payment gateway did not return a checkout link.', 'error');
              return;
            }
            window.location.assign(checkoutUrl);
          },
          error: (err) => {
            this.cartBusy = false;
            this.showToast(err.error?.message || 'Could not start payment.', 'error');
            this.changeDetector.detectChanges();
          },
        });
      },
      error: (err) => {
        this.cartBusy = false;
        this.showToast(err.error?.message || 'Could not create your order.', 'error');
        this.changeDetector.detectChanges();
      },
    });
  }

  get courseTitle(): string {
    return this.courseData?.title || 'Course Details';
  }

  get instructorName(): string {
    const instructor = this.courseData?.instructorId;
    return `${instructor?.firstName ?? ''} ${instructor?.lastName ?? ''}`.trim() || 'Lead Instructor';
  }

  get level(): string {
    const value = this.courseData?.level;
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'All Levels';
  }

  get duration(): string {
    return this.courseData?.duration ? `${this.courseData.duration} hours` : 'Self-paced';
  }

  get categoryName(): string {
    return this.courseData?.category?.name || 'Development';
  }

  get trackName(): string {
    return this.courseData?.track?.title || 'Professional Track';
  }

  get rating(): string {
    return this.courseData?.rating ? Number(this.courseData.rating).toFixed(1) : 'New';
  }

  get objectives(): string[] {
    return Array.isArray(this.courseData?.objectives) ? this.courseData.objectives : [];
  }

  get prerequisites(): string[] {
    return Array.isArray(this.courseData?.prerequisites) ? this.courseData.prerequisites : [];
  }

  getInstructorInitial(): string {
    return this.instructorName.charAt(0).toUpperCase();
  }

  goToPlayer(): void {
    if (!this.isStudent()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/learn', this.courseId]);
  }

  isStudent(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload)).role === 'student';
    } catch {
      return false;
    }
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.changeDetector.detectChanges();
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.changeDetector.detectChanges();
    }, 2600);
  }
}
