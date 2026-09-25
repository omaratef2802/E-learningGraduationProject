import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentItem } from '../../features/students/students.model';

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InstructorService {
  private readonly apiUrl = 'http://localhost:3000/E-learning/instructor';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    }
    const authHeader = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';
    return new HttpHeaders({
      Authorization: authHeader
    });
  }

  getInstructorStudents(): Observable<ApiResponse<StudentItem[]>> {
    return this.http.get<ApiResponse<StudentItem[]>>(`${this.apiUrl}/students`, {
      headers: this.getAuthHeaders()
    });
  }
}
