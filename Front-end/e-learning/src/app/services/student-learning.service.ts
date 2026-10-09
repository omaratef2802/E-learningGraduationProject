import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface StudentEnrollment {
  _id: string;
  courseId: {
    _id: string;
    title: string;
    image?: string;
    level?: string;
    duration?: number;
    instructorId?: { firstName?: string; lastName?: string };
  } | null;
  progress: number;
  status: 'in-progress' | 'completed' | 'not-started' | string;
  lastAccessedAt?: string;
  createdAt?: string;
}

export interface StudentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateBirth?: string;
  bio?: string;
  createdAt?: string;
}

export interface StudentCertificate {
  _id: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  certificateId: string;
  issueDate: string;
  verificationUrl: string;
  qrCode?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentLearningService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/E-learning/enroll';
  private readonly userUrl = 'http://localhost:3000/E-learning/users';

  getMyEnrollments(): Observable<StudentEnrollment[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: token });
    return this.http
      .get<{ data?: StudentEnrollment[] }>(`${this.apiUrl}/myCourses`, { headers })
      .pipe(map((response) => response.data ?? []));
  }

  getMyProfile(): Observable<StudentProfile> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: token });
    return this.http
      .get<{ data: StudentProfile }>(`${this.userUrl}/myProfile`, { headers })
      .pipe(map((response) => response.data));
  }

  updateMyProfile(updates: Pick<StudentProfile, 'firstName' | 'lastName' | 'phone' | 'dateBirth' | 'bio'>): Observable<StudentProfile> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: token });
    return this.http
      .patch<{ data: StudentProfile }>(`${this.userUrl}/profile`, updates, { headers })
      .pipe(map((response) => response.data));
  }

  getMyCertificates(): Observable<StudentCertificate[]> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: token });
    return this.http
      .get<{ data?: StudentCertificate[] }>(`http://localhost:3000/E-learning/certificate/myCertificates`, { headers })
      .pipe(map((response) => response.data ?? []));
  }
}
