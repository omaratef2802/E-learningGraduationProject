import { Component, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';

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

interface CartCourse {
  courseId: Course;
  price: number;
}

interface CartData {
  _id: string;
  userId: string;
  courses: CartCourse[];
  totalPrice: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cart = signal<CartData | null>(null);

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.getCart();
  }

  getCart(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.cartService.getCart().subscribe({
      next: (response: CartData) => {
        this.cart.set(response as CartData);
        this.loading.set(false);
      },

      error: (error) => {
        this.loading.set(false);

        console.log('Get cart error:', error);

        if (error.status === 404 || error.error?.message === 'Cart is empty') {
          this.cart.set(null);
          this.errorMessage.set('');
        } else {
          this.errorMessage.set(error.error?.message || 'Failed to load cart');
        }
      },
    });
  }

  removeFromCart(courseId: string): void {
    this.errorMessage.set('');

    this.cartService.removeFromCart(courseId).subscribe({
      next: (response: { cart: { courses: any; totalPrice: any } }) => {
        if (this.cart()) {
          this.cart.set({
            ...this.cart()!,
            courses: response.cart.courses,
            totalPrice: response.cart.totalPrice,
          });
        }

        this.successMessage.set('Course removed from cart');

        setTimeout(() => {
          this.successMessage.set('');
        }, 2000);
      },

      error: (error: { error: { message: any } }) => {
        console.log('Remove cart error:', error);

        this.errorMessage.set(error.error?.message || 'Failed to remove course from cart');

        setTimeout(() => {
          this.errorMessage.set('');
        }, 3000);
      },
    });
  }

  clearCart(): void {
    this.errorMessage.set('');

    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart.set(null);

        this.successMessage.set('Cart cleared successfully');

        setTimeout(() => {
          this.successMessage.set('');
        }, 2000);
      },

      error: (error: { error: { message: any } }) => {
        console.log('Clear cart error:', error);

        this.errorMessage.set(error.error?.message || 'Failed to clear cart');
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
}
