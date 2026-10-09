import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Category, Course, Track } from '../mock-types';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/E-learning';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token
    });
  }

  // --- Users & Admins ---
  // These endpoints answer with `{ data: [...] }`.
  getAllUsers(): Observable<any[]> {
    return this.http
      .get<{ data: any[] }>(`${this.apiUrl}/admins/myUsers`, { headers: this.getHeaders() })
      .pipe(map((res) => res.data ?? []));
  }

  getAllInstructors(): Observable<any[]> {
    return this.http
      .get<{ data: any[] }>(`${this.apiUrl}/admins/myInstructors`, { headers: this.getHeaders() })
      .pipe(map((res) => res.data ?? []));
  }

  getAllAdmins(): Observable<any[]> {
    return this.http
      .get<{ data: any[] }>(`${this.apiUrl}/admins/myAdmins`, { headers: this.getHeaders() })
      .pipe(map((res) => res.data ?? []));
  }

  createAdmin(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admins/addAdmin`, data, { headers: this.getHeaders() });
  }

  updateAdmin(data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admins/updateAdmin`, data, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admins/users/${id}`, { headers: this.getHeaders() });
  }

  updateUser(id: string, data: { firstName: string; lastName: string; email: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admins/users/${id}`, data, { headers: this.getHeaders() });
  }

  setUserActive(id: string, isActive: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admins/users/${id}/status`, { isActive }, { headers: this.getHeaders() });
  }
  
  getAdminProfile(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admins/profile/${id}`, { headers: this.getHeaders() });
  }

  getCurrentAdminProfile(): Observable<any> {
    const token = localStorage.getItem('token') || '';
    const userId = JSON.parse(atob(token.split('.')[1])).userId;
    return this.getAdminProfile(userId);
  }
  
  updateAdminPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admins/updatePassword`, data, { headers: this.getHeaders() });
  }

  // --- Categories ---
  // Category and track endpoints answer with `{ categories }` / `{ tracks }`,
  // while the course endpoints use `{ data }`. Each method unwraps its own key
  // so callers always receive a plain array.
  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ categories: Category[] }>(`${this.apiUrl}/category`)
      .pipe(map((res) => res.categories ?? []));
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/category/AddCatogry`, data, { headers: this.getHeaders() });
  }

  updateCategory(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/category/${id}`, data, { headers: this.getHeaders() });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/category/${id}`, { headers: this.getHeaders() });
  }

  // --- Tracks ---
  getTracks(): Observable<Track[]> {
    return this.http
      .get<{ tracks: Track[] }>(`${this.apiUrl}/track`)
      .pipe(map((res) => res.tracks ?? []));
  }

  createTrack(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/track/AddTrack`, data, { headers: this.getHeaders() });
  }

  updateTrack(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/track/updateTrack/${id}`, data, { headers: this.getHeaders() });
  }

  deleteTrack(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/track/deleteTrack/${id}`, { headers: this.getHeaders() });
  }

  // --- Courses ---
  getCourses(): Observable<Course[]> {
    return this.http
      .get<{ data: Course[] }>(`${this.apiUrl}/course/admin/all`, { headers: this.getHeaders() })
      .pipe(map((res) => res.data ?? []));
  }

  createCourse(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/course/admin/create`, data, { headers: this.getHeaders() });
  }

  updateCourseStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/course/status/${id}`, { status }, { headers: this.getHeaders() });
  }

  // --- Course review (admin decisions) ---

  /** Courses waiting for an admin decision. */
  getCoursesForReview(): Observable<Course[]> {
    return this.http
      .get<{ data: Course[] }>(`${this.apiUrl}/course/review/pending`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.data ?? []));
  }

  /**
   * Admin decision on a course under review. `request_changes` requires a
   * message, which is stored on the course and shown to the instructor.
   */
  reviewCourse(id: string, decision: 'approve' | 'request_changes', message?: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/course/review/${id}`,
      { decision, message },
      { headers: this.getHeaders() }
    );
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/course/deleteCourse/${id}`, { headers: this.getHeaders() });
  }

  // --- Notifications ---
  // The notification list endpoint answers with `{ notifications: [...] }`.
  getNotifications(): Observable<any[]> {
    return this.http
      .get<{ notifications: any[] }>(`${this.apiUrl}/Notification/getNotification`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.notifications ?? []));
  }

  sendNotification(data: any): Observable<any> {
    const requestedType = String(data.type || 'system').toLowerCase();
    const supportedTypes = ['payment', 'enrollment', 'project', 'certificate', 'review', 'course', 'system'];
    const payload = {
      to: data.to ?? data.recipientId,
      subject: data.subject ?? data.title,
      message: data.message,
      type: supportedTypes.includes(requestedType) ? requestedType : 'system',
    };
    return this.http.post(`${this.apiUrl}/Notification/sendNotification`, payload, { headers: this.getHeaders() });
  }

  markNotificationAsRead(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/Notification/updateNotification/${id}`, { isRead: true }, { headers: this.getHeaders() });
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Notification/deleteNotification/${id}`, { headers: this.getHeaders() });
  }

  // --- User Management Helper ---
  createUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/signup`, data);
  }
}
