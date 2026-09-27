import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private apiUrl = 'http://localhost:3000/E-learning';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/category`);
  }

  getTracks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/track`);
  }

  createCourse(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/course/addCourse`, data, { headers: this.getHeaders() });
  }

  createSection(courseId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/section/course/${courseId}`, data, { headers: this.getHeaders() });
  }

  getSections(courseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/section/course/${courseId}`, { headers: this.getHeaders() });
  }

  getCourse(courseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/course/${courseId}`);
  }
}
