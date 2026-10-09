import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { PaymentService } from '../../services/payment';
import { ActivatedRoute } from '@angular/router';

type CheckoutState = 'checkout' | 'success' | 'failed' | 'pending';

type PaymentMethod = 'credit' | 'paypal' | 'fawry';

interface CartCourse {
  courseId: string | { _id: string; title?: string; image?: string; slug?: string };
  price: number;
}

interface Cart {
  _id: string;
  userId: string;
  courses: CartCourse[];
  totalPrice: number;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment implements OnInit, OnDestroy {
  flowState = signal<CheckoutState>('checkout');

  selectedMethod = signal<PaymentMethod>('credit');

  fullName = signal('');
  email = signal('');

  profileLoading = signal(false);

  cardNumber = signal('');
  cardName = signal('');
  expiry = signal('');
  cvv = signal('');

  cardNumberError = signal('');
  cardNameError = signal('');
  expiryError = signal('');
  cvvError = signal('');

  saveCard = signal(false);

  cart = signal<Cart | null>(null);

  loading = signal(false);

  errorMessage = signal('');

  paymentId = signal('');

  transactionId = signal('');

  private readonly route = inject(ActivatedRoute);
  private statusTimer?: ReturnType<typeof setInterval>;

  constructor(private paymentService: PaymentService) {}

  ngOnDestroy(): void {
    if (this.statusTimer) clearInterval(this.statusTimer);
  }

  ngOnInit(): void {
    const returnedPaymentId = this.route.snapshot.queryParamMap.get('paymentId');
    if (returnedPaymentId) {
      this.paymentId.set(returnedPaymentId);
      this.flowState.set('pending');
      this.pollPaymentStatus(returnedPaymentId);
      return;
    }
    this.getProfile();
    this.getCart();
  }

  private pollPaymentStatus(paymentId: string): void {
    const check = () => this.paymentService.getPaymentStatus(paymentId).subscribe({
      next: (response) => {
        const status = response?.payment?.status;
        if (status === 'success') {
          if (this.statusTimer) clearInterval(this.statusTimer);
          this.transactionId.set(paymentId);
          this.flowState.set('success');
        } else if (status === 'failed') {
          if (this.statusTimer) clearInterval(this.statusTimer);
          this.flowState.set('failed');
          this.errorMessage.set('Payment was not completed. Please try again.');
        }
      },
      error: () => {},
    });
    check();
    this.statusTimer = setInterval(check, 3000);
  }

  getProfile(): void {
    this.profileLoading.set(true);

    this.paymentService.getProfile().subscribe({
      next: (response: { data: any }) => {
        const user = response.data || response;

        this.fullName.set(user.firstName + ' ' + user.lastName);

        this.email.set(user.email);

        this.profileLoading.set(false);
      },

      error: (error: { error: { message: any } }) => {
        console.log('Profile error:', error);

        this.profileLoading.set(false);

        this.errorMessage.set(error.error?.message || 'Failed to load user information');
      },
    });
  }

  getCart(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.paymentService.getCart().subscribe({
      next: (response: Cart) => {
        const cart = (response as any)?.cart ?? (response as any)?.data ?? response;
        this.cart.set(cart);
        if (!cart?.courses?.length) this.errorMessage.set('Your cart is empty. Add a course before checkout.');
        this.loading.set(false);
      },

      error: (error: { status: number }) => {
        this.loading.set(false);

        if (error.status === 404) {
          this.errorMessage.set('Your cart is empty');
        } else {
          this.errorMessage.set('Failed to load cart');
        }
      },
    });
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedMethod.set(method);

    this.cardNumberError.set('');
    this.cardNameError.set('');
    this.expiryError.set('');
    this.cvvError.set('');
    this.errorMessage.set('');
  }

  updateCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.cardNumber.set(input.value);

    if (input.value.trim()) {
      this.cardNumberError.set('');
    }
  }

  updateCardName(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.cardName.set(input.value);

    if (input.value.trim()) {
      this.cardNameError.set('');
    }
  }

  updateExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.expiry.set(input.value);

    if (input.value.trim()) {
      this.expiryError.set('');
    }
  }

  updateCvv(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.cvv.set(input.value);

    if (input.value.trim()) {
      this.cvvError.set('');
    }
  }

  processPayment(): void {
    this.errorMessage.set('');

    this.cardNumberError.set('');
    this.cardNameError.set('');
    this.expiryError.set('');
    this.cvvError.set('');

    const token = localStorage.getItem('token');

    if (!token) {
      this.errorMessage.set('Please login first to continue with payment');

      return;
    }

    if (!this.cart()?.courses?.length) {
      this.errorMessage.set('Your cart is empty. Add a course before checkout.');
      return;
    }

    this.loading.set(true);

    this.paymentService.createOrder().subscribe({
      next: (orderResponse: { order: { _id: string } }) => {
        const orderId = orderResponse.order._id;

      this.paymentService.createPayment(orderId).subscribe({
          next: (paymentResponse: { payment: any; checkoutUrl: string }) => {
            this.loading.set(false);
            if (!paymentResponse.checkoutUrl) {
              this.errorMessage.set('Could not open the payment gateway.');
              this.flowState.set('failed');
              return;
            }
            window.location.assign(paymentResponse.checkoutUrl);
          },

          error: (error: { error: { message: string } }) => {
            this.loading.set(false);

            console.log('Payment error:', error);

            this.flowState.set('failed');

            this.errorMessage.set(error.error?.message || 'Payment could not be completed');
          },
        });
      },

      error: (error: { error: { message: string } }) => {
        this.loading.set(false);

        console.log('Order error:', error);

        this.errorMessage.set(error.error?.message || 'Failed to create order');
      },
    });
  }

  getTotalPrice(): number {
    if (!this.cart()) {
      return 0;
    }

    return this.cart()!.totalPrice;
  }

  getCoursesCount(): number {
    if (!this.cart()) {
      return 0;
    }

    return this.cart()!.courses.length;
  }

  getCourseId(course: CartCourse): string {
    return typeof course.courseId === 'string' ? course.courseId : course.courseId?._id || '';
  }

  getCourseTitle(course: CartCourse): string {
    return typeof course.courseId === 'string' ? 'Course' : course.courseId?.title || 'Course';
  }

  getCourseImage(course: CartCourse): string {
    return typeof course.courseId === 'string' ? '' : course.courseId?.image || '';
  }

  backToCheckout(): void {
    this.flowState.set('checkout');

    this.errorMessage.set('');
  }
}
