import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private apiUrl = 'http://localhost:3000/wishlist';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      authorization: token ? token : '',
    });
  }

  getWishlist(): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  addToWishlist(courseId: string): Observable<any> {
    return this.http.post(
      this.apiUrl,
      { courseId: courseId },
      {
        headers: this.getHeaders(),
      },
    );
  }

  removeFromWishlist(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}`, {
      headers: this.getHeaders(),
    });
  }
}
