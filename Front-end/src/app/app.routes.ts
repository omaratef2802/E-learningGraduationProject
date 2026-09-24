import { Routes } from '@angular/router';
import { WishlistComponent } from './pages/wishlist/wishlist';
import { Payment } from './pages/payment/payment';
import { Cart } from './pages/cart/cart';

export const routes: Routes = [
    {
    path: 'wishlist',
    component: WishlistComponent
  },
  {
    path: 'payment',
    component: Payment
  },
  {
    path: 'cart',
    component: Cart,
  }
];
