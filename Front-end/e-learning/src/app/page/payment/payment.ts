import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PaymentService } from '../../services/payment';

type CheckoutState = 'checkout' | 'success' | 'failed' | 'pending';

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

type PayPalButtonsInstance = { render: (container: HTMLElement) => Promise<void> };
type PayPalSdk = { Buttons: (options: Record<string, unknown>) => PayPalButtonsInstance };

declare global {
  interface Window {
    paypal?: PayPalSdk;
  }
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment implements OnInit, OnDestroy {
  @ViewChild('paypalButtons') private paypalButtonsElement?: ElementRef<HTMLDivElement>;

  flowState = signal<CheckoutState>('checkout');
  fullName = signal('');
  email = signal('');
  profileLoading = signal(false);
  cart = signal<Cart | null>(null);
  loading = signal(false);
  paypalLoading = signal(false);
  paypalReady = signal(false);
  errorMessage = signal('');
  paymentId = signal('');
  transactionId = signal('');
  currency = signal('USD');
  priceCurrency = signal('EGP');
  egpPerUsd = signal(0);
  rateIsSandboxEstimate = signal(false);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  private statusTimer?: ReturnType<typeof setInterval>;
  private activeOrderId: string | null = null;
  private renderStarted = false;
  private sdkLoadPromise?: Promise<void>;

  ngOnInit(): void {
    this.activeOrderId = this.route.snapshot.queryParamMap.get('orderId');
    this.getProfile();
    if (this.activeOrderId) {
      this.getOrder(this.activeOrderId);
    } else {
      this.getCart();
    }
  }

  ngOnDestroy(): void {
    if (this.statusTimer) clearInterval(this.statusTimer);
  }

  getProfile(): void {
    this.profileLoading.set(true);
    this.paymentService.getProfile().subscribe({
      next: (response: any) => {
        const user = response?.data || response;
        this.fullName.set([user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Learner');
        this.email.set(user?.email || '');
        this.profileLoading.set(false);
      },
      error: (error: any) => {
        this.profileLoading.set(false);
        this.errorMessage.set(error?.error?.message || 'Could not load your account information. Please sign in again.');
      },
    });
  }

  getCart(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.paymentService.getCart().subscribe({
      next: (response: any) => {
        const cart = response?.cart ?? response?.data ?? response;
        this.cart.set(cart);
        this.loading.set(false);
        if (!cart?.courses?.length) {
          this.errorMessage.set('Your cart is empty. Add a course before checkout.');
          return;
        }
        this.setupPayPalButtons();
      },
      error: (error: any) => {
        this.loading.set(false);
        this.errorMessage.set(error?.error?.message || (error?.status === 404 ? 'Your cart is empty.' : 'Failed to load your cart.'));
      },
    });
  }

  getOrder(orderId: string): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.paymentService.getOrder(orderId).subscribe({
      next: (response: any) => {
        const order = response?.data ?? response?.order ?? response;
        if (!order?._id || !Array.isArray(order.courses) || !order.courses.length) {
          this.loading.set(false);
          this.errorMessage.set('This order has no courses to check out.');
          return;
        }
        this.activeOrderId = order._id;
        this.cart.set({
          _id: order._id,
          userId: order.userId,
          courses: order.courses,
          totalPrice: Number(order.totalPrice) || 0,
        });
        this.loading.set(false);
        this.setupPayPalButtons();
      },
      error: (error: any) => {
        this.loading.set(false);
        this.errorMessage.set(error?.error?.message || 'Could not load this order. Please return to the course page and try again.');
      },
    });
  }

  private setupPayPalButtons(): void {
    if (this.renderStarted || !this.cart()?.courses?.length) return;
    this.renderStarted = true;
    this.paypalLoading.set(true);
    this.errorMessage.set('');

    this.paymentService.getPayPalConfig().subscribe({
      next: (config) => {
        this.currency.set(config.currency || 'USD');
        this.priceCurrency.set(config.priceCurrency || 'EGP');
        this.egpPerUsd.set(Number(config.egpPerUsd) || 0);
        this.rateIsSandboxEstimate.set(!!config.rateIsSandboxEstimate);
        this.loadPayPalSdk(config.clientId, this.currency()).then(() => {
          // Angular renders the checkout branch before this asynchronous callback runs.
          setTimeout(() => this.renderPayPalButtons(), 0);
        }).catch((error: unknown) => {
          this.renderStarted = false;
          this.paypalLoading.set(false);
          this.errorMessage.set(error instanceof Error ? error.message : 'Could not load secure PayPal checkout.');
        });
      },
      error: (error: any) => {
        this.renderStarted = false;
        this.paypalLoading.set(false);
        this.errorMessage.set(error?.error?.message || 'PayPal is not configured on the backend yet.');
      },
    });
  }

  private loadPayPalSdk(clientId: string, currency: string): Promise<void> {
    if (window.paypal) return Promise.resolve();
    if (this.sdkLoadPromise) return this.sdkLoadPromise;

    this.sdkLoadPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-pathwayed-paypal-sdk="true"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('PayPal checkout script could not be loaded.')), { once: true });
        if (window.paypal) resolve();
        return;
      }

      const script = document.createElement('script');
      script.dataset['pathwayedPaypalSdk'] = 'true';
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons&enable-funding=card`;
      script.async = true;
      script.onload = () => window.paypal ? resolve() : reject(new Error('PayPal checkout loaded without its button SDK.'));
      script.onerror = () => {
        script.remove();
        this.sdkLoadPromise = undefined;
        reject(new Error('PayPal checkout script could not be loaded. Check your internet connection and Client ID.'));
      };
      document.head.appendChild(script);
    });

    return this.sdkLoadPromise;
  }

  private renderPayPalButtons(): void {
    const container = this.paypalButtonsElement?.nativeElement;
    const paypal = window.paypal;
    if (!container || !paypal) {
      this.renderStarted = false;
      this.paypalLoading.set(false);
      this.errorMessage.set('PayPal checkout is not ready. Please reload the page and try again.');
      return;
    }

    container.replaceChildren();
    const buttons = paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'paypal', tagline: false },
      createOrder: async () => {
        this.errorMessage.set('');
        try {
          if (!this.activeOrderId) {
            const orderResponse: any = await firstValueFrom(this.paymentService.createOrder());
            this.activeOrderId = orderResponse?.order?._id || null;
          }
          if (!this.activeOrderId) throw new Error('The order could not be created. Please try again.');

          const response: any = await firstValueFrom(this.paymentService.createPayPalOrder(this.activeOrderId));
          const paypalOrderId = response?.paypalOrderId;
          if (!paypalOrderId) throw new Error('PayPal did not return an order ID.');
          this.paymentId.set(response?.payment?._id || '');
          return paypalOrderId;
        } catch (error: any) {
          this.errorMessage.set(error?.error?.message || error?.message || 'Could not start PayPal checkout.');
          throw error;
        }
      },
      onApprove: async (data: { orderID: string }) => {
        this.loading.set(true);
        this.errorMessage.set('');
        try {
          const response: any = await firstValueFrom(this.paymentService.capturePayPalOrder(data.orderID));
          const status = response?.payment?.status;
          if (status === 'success') {
            this.paymentId.set(response.payment._id || this.paymentId());
            this.transactionId.set(response.captureId || response.payment.gatewayTransactionId || data.orderID);
            this.flowState.set('success');
            this.paypalReady.set(false);
            return;
          }
          if (status === 'processing') {
            this.flowState.set('pending');
            this.startPaymentStatusPolling(this.paymentId());
            return;
          }
          throw new Error(response?.message || 'PayPal has not confirmed the payment yet.');
        } catch (error: any) {
          this.errorMessage.set(error?.error?.message || error?.message || 'Could not confirm payment. Please check your PayPal Sandbox account and retry.');
          this.flowState.set('failed');
        } finally {
          this.loading.set(false);
        }
      },
      onCancel: () => {
        this.errorMessage.set('You cancelled PayPal checkout. No course was unlocked. You can try again whenever you are ready.');
      },
      onError: (error: unknown) => {
        this.errorMessage.set(error instanceof Error ? error.message : 'PayPal checkout encountered an error. Please try again.');
      },
    });

    buttons.render(container).then(() => {
      this.paypalLoading.set(false);
      this.paypalReady.set(true);
    }).catch((error: unknown) => {
      this.renderStarted = false;
      this.paypalLoading.set(false);
      this.errorMessage.set(error instanceof Error ? error.message : 'PayPal buttons could not be displayed.');
    });
  }

  private startPaymentStatusPolling(paymentId: string): void {
    if (!paymentId) return;
    if (this.statusTimer) clearInterval(this.statusTimer);
    const check = () => this.paymentService.getPaymentStatus(paymentId).subscribe({
      next: (response: any) => {
        const payment = response?.payment;
        if (payment?.status === 'success') {
          if (this.statusTimer) clearInterval(this.statusTimer);
          this.transactionId.set(payment.gatewayTransactionId || paymentId);
          this.flowState.set('success');
        } else if (payment?.status === 'failed') {
          if (this.statusTimer) clearInterval(this.statusTimer);
          this.flowState.set('failed');
          this.errorMessage.set('Payment was not completed. Please try again.');
        }
      },
      error: () => {},
    });
    check();
    this.statusTimer = setInterval(check, 2500);
  }

  getTotalPrice(): number {
    return Number(this.cart()?.totalPrice || 0);
  }

  getCoursesCount(): number {
    return this.cart()?.courses?.length || 0;
  }

  getPayPalTotalPrice(): number {
    const localTotal = this.getTotalPrice();
    if (this.priceCurrency() === 'EGP' && this.currency() === 'USD' && this.egpPerUsd() > 0) {
      return Math.round((localTotal / this.egpPerUsd() + Number.EPSILON) * 100) / 100;
    }
    return localTotal;
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
    this.renderStarted = false;
    this.paypalReady.set(false);
    setTimeout(() => this.setupPayPalButtons(), 0);
  }

  goToMyCourses(): void {
    this.router.navigate(['/student-dashboard']);
  }
}
