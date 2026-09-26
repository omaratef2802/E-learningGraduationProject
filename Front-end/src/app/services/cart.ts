import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:3000/cart';

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
    });
  }

  addToCart(courseId: string, price: number): Observable<any> {
    return this.http.post(
      this.apiUrl,
      {
        courseId: courseId,
        price: price,
      },
      {
        headers: this.getHeaders(),
      },
    );
  }

  removeFromCart(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}`, {
      headers: this.getHeaders(),
    });
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear`, {
      headers: this.getHeaders(),
    });
  }
}
