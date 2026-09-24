import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  _id: string;
  title: string;
  description: string;
  slug: string;
  image?: string;

  instructorId:
    | string
    | {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
      };

  category:
    | string
    | {
        _id: string;
        name: string;
        slug: string;
      };

  track:
    | string
    | {
        _id: string;
        title: string;
        slug: string;
      };

  price: number;

  level: 'beginner' | 'intermediate' | 'advanced';

  rating: number;

  duration?: {
    value: number;
    unit: 'hours' | 'minutes';
  };

  status: 'draft' | 'published' | 'archived';

  objectives?: string[];

  prerequisites?: string[];

  createdAt?: string;

  updatedAt?: string;
}

export interface CourseResponse {
  success: boolean;
  data: Course[];
  message?: string;
}

export interface SingleCourseResponse {
  success: boolean;
  data: Course;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/course';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: token || '',
      'Content-Type': 'application/json',
    });
  }

  getCourses(): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  getCourseById(id: string): Observable<SingleCourseResponse> {
    return this.http.get<SingleCourseResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  createCourse(course: any): Observable<SingleCourseResponse> {
    return this.http.post<SingleCourseResponse>(this.apiUrl, course, {
      headers: this.getHeaders(),
    });
  }

  updateCourse(id: string, course: any): Observable<SingleCourseResponse> {
    return this.http.put<SingleCourseResponse>(`${this.apiUrl}/${id}`, course, {
      headers: this.getHeaders(),
    });
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
