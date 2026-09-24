import { Routes } from '@angular/router';
import { WishlistComponent } from './pages/wishlist/wishlist';
import { Payment } from './pages/payment/payment';
import { Cart } from './pages/cart/cart';
// import { Courses } from './pages/course/course';

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
  },
  // {
  //   path: 'courses',
  //   component: Courses,
  // }
];
