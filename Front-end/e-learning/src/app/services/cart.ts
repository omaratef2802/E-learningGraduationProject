import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface CartSnapshot {
  _id?: string;
  userId?: string;
  courses: Array<{ courseId: any; price: number }>;
  totalPrice: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:3000/E-learning/cart';
  readonly cart = signal<CartSnapshot | null>(null);
  readonly itemCount = computed(() => this.cart()?.courses?.length ?? 0);

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      authorization: token ? token : '',
    });
  }

  getCart(): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.getHeaders(),
    }).pipe(tap((response) => this.updateCart(response)));
  }

  refreshCart(): void {
    this.getCart().subscribe({ error: () => {} });
  }

  addToCart(courseId: string, price: number): Observable<any> {
    const previousCart = this.cart();
    const alreadyAdded = previousCart?.courses.some((item) =>
      String(item?.courseId?._id ?? item?.courseId) === String(courseId)
    ) ?? false;
    if (!alreadyAdded) {
      this.cart.set({
        ...(previousCart ?? { courses: [], totalPrice: 0 }),
        courses: [...(previousCart?.courses ?? []), { courseId, price }],
        totalPrice: (previousCart?.totalPrice ?? 0) + price,
      });
    }

    return this.http.post(
      `${this.apiUrl}/courses`,
      {
        courseId: courseId,
        price: price,
      },
      {
        headers: this.getHeaders(),
      },
    ).pipe(tap((response) => {
      this.updateCart(response);
      // The add response is not populated with course details; refresh the
      // canonical cart so the dashboard preview and cart page stay current.
      this.refreshCart();
    }), catchError((error) => {
      if (!alreadyAdded) this.cart.set(previousCart);
      return throwError(() => error);
    }));
  }

  removeFromCart(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses/${courseId}`, {
      headers: this.getHeaders(),
    }).pipe(tap((response) => this.updateCart(response)));
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/courses`, {
      headers: this.getHeaders(),
    }).pipe(tap((response) => {
      this.updateCart(response);
      this.cart.set({ courses: [], totalPrice: 0 });
    }));
  }

  clearState(): void {
    this.cart.set(null);
  }

  private updateCart(response: any): void {
    const snapshot = response?.cart ?? response?.data?.cart ?? response?.data ?? response;
    if (!snapshot || !Array.isArray(snapshot.courses)) return;
    this.cart.set({
      _id: snapshot._id,
      userId: snapshot.userId,
      courses: snapshot.courses,
      totalPrice: Number(snapshot.totalPrice) || 0,
    });
  }
}
