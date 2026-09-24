import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Course {

  private apiUrl = 'http://localhost:3000/E-learning/course';

  constructor(private http: HttpClient) {}

  getAllCourses() {
    return this.http.get(this.apiUrl);
  }
}