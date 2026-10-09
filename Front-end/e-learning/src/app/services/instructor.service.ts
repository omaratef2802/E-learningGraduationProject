import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Category, Course, Track } from '../mock-types';

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

  /**
   * The category endpoints answer with `{ categories: [...] }` rather than the
   * `{ data: [...] }` shape used by the course endpoints, so each service maps
   * its own response and callers always receive a plain array.
   */
  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ categories: Category[] }>(`${this.apiUrl}/category`)
      .pipe(map((res) => res.categories ?? []));
  }

  getTrackById(id: string): Observable<Track[]> {
    return this.http.get<{ track: Track }>(`${this.apiUrl}/track/trackById/${id}`).pipe(
      map((res) => (res.track ? [res.track] : [])),
    );
  }

  getTracks(): Observable<Track[]> {
    return this.http
      .get<{ tracks: Track[] }>(`${this.apiUrl}/track`)
      .pipe(map((res) => res.tracks ?? []));
  }

  getTracksByCategory(categoryId: string): Observable<Track[]> {
    return this.http
      .get<{ tracks: Track[] }>(`${this.apiUrl}/track/category/${categoryId}`)
      .pipe(map((res) => res.tracks ?? []));
  }

  getCoursesByCategory(categoryId: string): Observable<Course[]> {
    return this.http
      .get<{ data: Course[] }>(`${this.apiUrl}/course/category/${categoryId}`)
      .pipe(map((res) => res.data ?? []));
  }

  getCoursesByTrack(trackId: string): Observable<Course[]> {
    return this.http
      .get<{ data: Course[] }>(`${this.apiUrl}/course/track/${trackId}`)
      .pipe(map((res) => res.data ?? []));
  }

  /** Public: every published course taught by one instructor. */
  getCoursesByInstructor(instructorId: string): Observable<Course[]> {
    return this.http
      .get<{ data: Course[] }>(`${this.apiUrl}/course/instructor/${instructorId}`)
      .pipe(map((res) => res.data ?? []));
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

  getCourseOutline(courseId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/section/course/${courseId}/outline`);
  }

  getCourse(courseId: string): Observable<Course> {
    return this.http
      .get<{ data: Course }>(`${this.apiUrl}/course/${courseId}`)
      .pipe(map((res) => res.data));
  }

  getAllCourses(limit?: number): Observable<Course[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.http
      .get<{ data: Course[] }>(`${this.apiUrl}/course${query}`)
      .pipe(map((res) => res.data ?? []));
  }

  getMyCourses(): Observable<Course[]> {
    return this.http
      .get<{ data: Course[] }>(`${this.apiUrl}/course/myCourses`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.data ?? []));
  }

  deleteCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/course/deleteCourse/${courseId}`, { headers: this.getHeaders() });
  }
}

