import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { WishlistService } from '../../services/wishlist';

@Component({
  selector: 'app-course-actions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './course-actions.html',
  styleUrl: './course-actions.css',
})
export class CourseActions {
  @Input({ required: true }) courseId = '';
  @Input() showWishlist = true;

  busyAction: 'cart' | 'wishlist' | '' = '';
  message = '';
  error = '';
  requiresLogin = false;

  constructor(
    private readonly cart: CartService,
    private readonly wishlist: WishlistService,
  ) {}

  addToCart(): void {
    if (!this.requireLogin()) return;
    this.startAction('cart');
    this.cart.addToCart(this.courseId).subscribe({
      next: () => this.finishAction('Course added to your cart.', 'cart'),
      error: (response) => this.failAction(response, 'Could not add this course to your cart.'),
    });
  }

  saveToWishlist(): void {
    if (!this.requireLogin()) return;
    this.startAction('wishlist');
    this.wishlist.addToWishlist(this.courseId).subscribe({
      next: () => this.finishAction('Course saved to your wishlist.', 'wishlist'),
      error: (response) => this.failAction(response, 'Could not save this course.'),
    });
  }

  private requireLogin(): boolean {
    if (localStorage.getItem('token')) return true;
    this.error = 'Log in with a student account to save or buy courses.';
    this.requiresLogin = true;
    this.message = '';
    return false;
  }

  private startAction(action: 'cart' | 'wishlist'): void {
    this.busyAction = action;
    this.error = '';
    this.message = '';
    this.requiresLogin = false;
  }

  private finishAction(message: string, action: 'cart' | 'wishlist'): void {
    this.busyAction = '';
    this.message = message;
    this.error = '';
    this.completedAction = action;
  }

  completedAction: 'cart' | 'wishlist' | '' = '';

  private failAction(response: any, fallback: string): void {
    this.busyAction = '';
    this.message = '';
    this.error = response.error?.message || fallback;
    this.requiresLogin = false;
  }
}