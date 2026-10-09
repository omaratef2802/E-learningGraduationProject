import {
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AdminService } from '../../services/admin.service';
import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Define our own local interfaces to replace the mock ones
export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalRevenue: number;
}
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
}
export interface AdminCourse {
  id: string;
  title: string;
  instructor: string;
  status: string;
  studentsCount: number;
  rating: number;
  date?: string;
}
export interface AdminActivity {
  id: string;
  type: 'User' | 'Course' | 'Enrollment' | 'Certificate';
  title: string;
  description: string;
  time: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminSidebar
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {

  private readonly router = inject(Router);
  private adminService = inject(AdminService);

  stats: AdminStats = {
     totalUsers: 0,
     totalStudents: 0,
     totalInstructors: 0,
     totalCourses: 0,
     totalRevenue: 0
  };
  recentUsers: AdminUser[] = [];
  recentCourses: AdminCourse[] = [];
  recentActivities: AdminActivity[] = [];
  loading = true;
  errorMessage = '';

  adminProfileName = 'Admin User';
  adminProfileInitials = 'AU';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.recentActivities = [];
    this.recentUsers = [];
    this.recentCourses = [];
    let failedRequests = 0;
    forkJoin({
      users: this.adminService.getAllUsers().pipe(catchError((error) => { console.error(error); failedRequests++; return of([]); })),
      courses: this.adminService.getCourses().pipe(catchError((error) => { console.error(error); failedRequests++; return of([]); })),
      instructors: this.adminService.getAllInstructors().pipe(catchError((error) => { console.error(error); failedRequests++; return of([]); })),
      admins: this.adminService.getAllAdmins().pipe(catchError((error) => { console.error(error); failedRequests++; return of([]); })),
    }).subscribe(({ users, courses, instructors, admins }) => {
      this.stats.totalStudents = users.length;
      this.stats.totalInstructors = instructors.length;
      this.stats.totalUsers = users.length + instructors.length + admins.length;
      this.stats.totalCourses = courses.length;
      this.recentUsers = users.slice(0, 5).map((user: any) => ({
        id: user._id || user.id,
        name: user.username || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email || '',
        role: 'Student',
        status: 'Active',
        joinDate: user.createdAt || new Date().toISOString(),
      }));
      this.recentCourses = courses.slice(0, 5).map((course: any) => ({
        id: course._id || course.id,
        title: course.title || course.name || 'Untitled course',
        instructor: typeof course.instructorId === 'object' && course.instructorId
          ? `${course.instructorId.firstName || ''} ${course.instructorId.lastName || ''}`.trim() || 'Unknown'
          : 'Unknown',
        status: course.status || 'Draft',
        studentsCount: course.enrolledStudents?.length || 0,
        rating: course.rating || 0,
        date: course.createdAt || '',
      }));
      if (failedRequests) this.errorMessage = 'Some dashboard data could not be loaded. Check your admin access and try refreshing.';
      this.loading = false;
    });
  }

  openUsers(): void { this.router.navigate(['/admin-users']); }
  openCourses(): void { this.router.navigate(['/admin-courses']); }
  openProfile(): void { this.router.navigate(['/admin-profile']); }
  openNotifications(): void { this.router.navigate(['/admin-notifications']); }
  openCategories(): void { this.router.navigate(['/admin-categories']); }
  openReports(): void { this.router.navigate(['/admin-reports']); }
  openTracks(): void { this.router.navigate(['/admin-tracks']); }
  addCourse(): void { this.router.navigate(['/admin-create-course']); }
  addInstructor(): void { this.router.navigate(['/admin-users']); }

  get profileName(): string {
    return this.adminProfileName;
  }

  get profileInitials(): string {
    return this.adminProfileInitials;
  }

  getUserInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  getActivityIcon(type: AdminActivity['type']): string {
    switch (type) {
      case 'User': return 'â™™';
      case 'Course': return 'â–£';
      case 'Enrollment': return 'â†—';
      case 'Certificate': return 'âœª';
      default: return 'â€¢';
    }
  }

  getCourseStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }
}
