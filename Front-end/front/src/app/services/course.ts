import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  _id: string;
  title: string;
  description: string;
  slug: string;
  image: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  duration: number;
  status: 'draft' | 'published' | 'archived';

  instructorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  category: {
    _id: string;
    name: string;
    slug: string;
  };

  track: {
    _id: string;
    title: string;
    slug: string;
  };

  objectives: string[];
  prerequisites: string[];
}

interface CoursesResponse {
  success: boolean;
  count: number;
  total: number;
  skip: number;
  limit: number;
  hasMore: boolean;
  data: Course[];
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/courses';

  constructor(private http: HttpClient) {}

  getAllCourses(): Observable<CoursesResponse> {
    return this.http.get<CoursesResponse>(`${this.apiUrl}?limit=50&skip=0`);
  }

  getCourseById(id: string): Observable<{ success: boolean; data: Course }> {
    return this.http.get<{ success: boolean; data: Course }>(`${this.apiUrl}/${id}`);
  }
}
