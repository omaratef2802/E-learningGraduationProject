import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PayPalConfig {
  clientId: string;
  currency: string;
  priceCurrency: string;
  egpPerUsd: number | null;
  rateIsSandboxEstimate: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly apiUrl = 'http://localhost:3000/E-learning';
  private readonly paymentUrl = `${this.apiUrl}/payments`;
  private readonly orderUrl = `${this.apiUrl}/orders`;
  private readonly cartUrl = `${this.apiUrl}/cart`;
  private readonly userUrl = `${this.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ authorization: token || '' });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.userUrl}/myProfile`, { headers: this.getHeaders() });
  }

  getCart(): Observable<any> {
    return this.http.get(this.cartUrl, { headers: this.getHeaders() });
  }

  createOrder(): Observable<any> {
    return this.http.post(this.orderUrl, {}, { headers: this.getHeaders() });
  }

  getOrder(orderId: string): Observable<any> {
    return this.http.get(`${this.orderUrl}/${encodeURIComponent(orderId)}`, { headers: this.getHeaders() });
  }

  buyNow(courseId: string): Observable<any> {
    return this.http.post(`${this.orderUrl}/buy-now`, { courseId }, { headers: this.getHeaders() });
  }

  getPayPalConfig(): Observable<PayPalConfig> {
    return this.http.get<PayPalConfig>(`${this.paymentUrl}/paypal/config`, { headers: this.getHeaders() });
  }

  createPayPalOrder(orderId: string): Observable<any> {
    return this.http.post(`${this.paymentUrl}/paypal/create-order`, { orderId }, { headers: this.getHeaders() });
  }

  capturePayPalOrder(paypalOrderId: string): Observable<any> {
    return this.http.post(`${this.paymentUrl}/paypal/capture-order`, { paypalOrderId }, { headers: this.getHeaders() });
  }

  getPaymentStatus(paymentId: string): Observable<any> {
    return this.http.get(`${this.paymentUrl}/${encodeURIComponent(paymentId)}/status`, { headers: this.getHeaders() });
  }

  getPaymentHistory(): Observable<any> {
    return this.http.get(this.paymentUrl, { headers: this.getHeaders() });
  }
}
