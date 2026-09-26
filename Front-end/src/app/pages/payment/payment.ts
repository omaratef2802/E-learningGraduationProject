import { Component, OnInit, signal } from '@angular/core';
import { PaymentService } from '../../services/payment';

type CheckoutState = 'checkout' | 'success' | 'failed' | 'pending';

type PaymentMethod = 'credit' | 'paypal' | 'fawry';

interface CartCourse {
  courseId: string;
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
export class Payment implements OnInit {
  flowState = signal<CheckoutState>('checkout');

  selectedMethod = signal<PaymentMethod>('credit');

  // User data from database
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

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.getProfile();
    this.getCart();
  }

  // Get logged-in user data from database
  getProfile(): void {
    this.profileLoading.set(true);

    this.paymentService.getProfile().subscribe({
      next: (response: { data: any; }) => {
        const user = response.data || response;

        this.fullName.set(user.firstName + ' ' + user.lastName);

        this.email.set(user.email);

        this.profileLoading.set(false);
      },

      error: (error: { error: { message: any; }; }) => {
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
        this.cart.set(response);
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

    // Validate credit card fields
    if (this.selectedMethod() === 'credit') {
      let cardError = false;

      const cardNumber = this.cardNumber().replace(/\s/g, '');

      if (!cardNumber) {
        this.cardNumberError.set('Card number is required');
        cardError = true;
      } else if (!/^\d{16}$/.test(cardNumber)) {
        this.cardNumberError.set('Card number must be 16 digits');
        cardError = true;
      }

      if (!this.cardName().trim()) {
        this.cardNameError.set('Name on card is required');
        cardError = true;
      }

      if (!this.expiry().trim()) {
        this.expiryError.set('Expiry date is required');
        cardError = true;
      } else if (!/^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/.test(this.expiry())) {
        this.expiryError.set('Use MM / YY format');
        cardError = true;
      }

      if (!this.cvv().trim()) {
        this.cvvError.set('CVV is required');
        cardError = true;
      } else if (!/^\d{3,4}$/.test(this.cvv())) {
        this.cvvError.set('CVV must be 3 or 4 digits');
        cardError = true;
      }

      if (cardError) {
        return;
      }
    }

    if (!this.cart()) {
      this.errorMessage.set('Cart is empty');
      return;
    }

    this.loading.set(true);

    // Create Order
    this.paymentService.createOrder().subscribe({
      next: (orderResponse: { order: { _id: string } }) => {
        const orderId = orderResponse.order._id;

        // Create Payment
        this.paymentService.createPayment(orderId, this.selectedMethod()).subscribe({
          next: (paymentResponse: { payment: any }) => {
            this.loading.set(false);

            const payment = paymentResponse.payment;

            this.paymentId.set(payment._id);

            if (payment.status === 'success') {
              this.transactionId.set(payment._id);

              this.flowState.set('success');
            } else if (payment.status === 'failed') {
              this.flowState.set('failed');
            } else {
              this.flowState.set('pending');
            }
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

  backToCheckout(): void {
    this.flowState.set('checkout');

    this.errorMessage.set('');
  }
}
