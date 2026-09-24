import { Component, signal } from '@angular/core';
import { Payment } from './pages/payment/payment';
import { Cart } from './pages/cart/cart';
import { WishlistComponent } from './pages/wishlist/wishlist';
// import { Wishlist } from './pages/wishlist/wishlist';
// import { Payment } from './pages/payment/payment';
// import { RouterOutlet } from '@angular/router';

@Component({
  // imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  imports: [Payment, Cart, WishlistComponent],
})
export class App {
  protected readonly title = signal('frontend');
}
