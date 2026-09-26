import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {

  private paymentUrl = 'http://localhost:3000/payment';
  private orderUrl = 'http://localhost:3000/order';
  private cartUrl = 'http://localhost:3000/cart';
  private userUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      authorization: token ? token : '',
    });
  }

  // Get logged-in user profile
  getProfile(): Observable<any> {

    return this.http.get(
      `${this.userUrl}/profile`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // Get cart
  getCart(): Observable<any> {

    return this.http.get(
      this.cartUrl,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // Create order
  createOrder(): Observable<any> {

    return this.http.post(
      this.orderUrl,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  // Create payment
  createPayment(
    orderId: string,
    paymentMethod: string
  ): Observable<any> {

    return this.http.post(
      this.paymentUrl,
      {
        orderId: orderId,
        paymentMethod: paymentMethod,
      },
      {
        headers: this.getHeaders(),
      }
    );
  }

  // Get payment history
  getPaymentHistory(): Observable<any> {

    return this.http.get(
      `${this.paymentUrl}/history`,
      {
        headers: this.getHeaders(),
      }
    );
  }
}