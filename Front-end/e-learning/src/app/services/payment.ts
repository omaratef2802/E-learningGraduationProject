import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly apiUrl = 'http://localhost:3000/E-learning';
  private paymentUrl = `${this.apiUrl}/payments`;
  private orderUrl = `${this.apiUrl}/orders`;
  private cartUrl = `${this.apiUrl}/cart`;
  private userUrl = `${this.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      authorization: token ? token : '',
    });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.userUrl}/myProfile`, {
      headers: this.getHeaders(),
    });
  }

  getCart(): Observable<any> {
    return this.http.get(this.cartUrl, {
      headers: this.getHeaders(),
    });
  }

  createOrder(): Observable<any> {
    return this.http.post(
      this.orderUrl,
      {},
      {
        headers: this.getHeaders(),
      },
    );
  }

  buyNow(courseId: string): Observable<any> {
    return this.http.post(`${this.orderUrl}/buy-now`, { courseId }, { headers: this.getHeaders() });
  }

  getPaymentStatus(paymentId: string): Observable<any> {
    return this.http.get(`${this.paymentUrl}/${paymentId}/status`, { headers: this.getHeaders() });
  }

  createPayment(orderId: string): Observable<any> {
    return this.http.post(
      this.paymentUrl,
      {
        orderId: orderId,
        paymentMethod: 'paymob',
      },
      {
        headers: this.getHeaders(),
      },
    );
  }

  getPaymentHistory(): Observable<any> {
    return this.http.get(this.paymentUrl, {
      headers: this.getHeaders(),
    });
  }
}
