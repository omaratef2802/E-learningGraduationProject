import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admins/myUsers`, { headers: this.getHeaders() });
  }

  getAllInstructors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admins/myInstructors`, { headers: this.getHeaders() });
  }

  getAllAdmins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admins/myAdmins`, { headers: this.getHeaders() });
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
  
  getAdminProfile(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admins/profile/${id}`, { headers: this.getHeaders() });
  }
  
  updateAdminPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admins/updatePassword`, data, { headers: this.getHeaders() });
  }

  // --- Categories ---
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/category`);
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
  getTracks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/track`);
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
  getCourses(): Observable<any> {
    return this.http.get(`${this.apiUrl}/course/courses`);
  }

  createCourse(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/course/addCourse`, data, { headers: this.getHeaders() });
  }

  updateCourseStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/course/status/${id}`, { status }, { headers: this.getHeaders() });
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/course/deleteCourse/${id}`, { headers: this.getHeaders() });
  }

  // --- Notifications ---
  getNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Notification/getNotification`, { headers: this.getHeaders() });
  }

  sendNotification(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Notification/sendNotification`, data, { headers: this.getHeaders() });
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Notification/deleteNotification/${id}`, { headers: this.getHeaders() });
  }

  // --- User Management Helper ---
  createUser(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/signup`, data);
  }
}
