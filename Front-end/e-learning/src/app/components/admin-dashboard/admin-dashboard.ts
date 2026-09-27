import {
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AdminService } from '../../services/admin.service';
import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

// Define our own local interfaces to replace the mock ones
export interface AdminStats {
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
     totalStudents: 0,
     totalInstructors: 0,
     totalCourses: 0,
     totalRevenue: 0
  };
  recentUsers: AdminUser[] = [];
  recentCourses: AdminCourse[] = [];
  recentActivities: AdminActivity[] = [];
  loading = false;
  errorMessage = '';

  adminProfileName = 'Admin User';
  adminProfileInitials = 'AU';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    // Wipe out any mock data
    this.recentActivities = [];
    this.recentUsers = [];
    this.recentCourses = [];
    
    // Real API Data
    this.adminService.getAllUsers().subscribe({
       next: (res: any) => {
          const users = res.data || res || [];
          this.stats.totalStudents = users.length;
          this.recentUsers = users.slice(0, 5).map((u: any) => ({
             id: u._id || u.id,
             name: u.username || u.name || `${u.firstName} ${u.lastName}`,
             email: u.email,
             role: 'Student',
             status: 'Active',
             joinDate: u.createdAt || new Date().toISOString()
          }));
       },
       error: (err) => console.error(err)
    });

    this.adminService.getCourses().subscribe({
       next: (res: any) => {
          const courses = res.data || res || [];
          this.stats.totalCourses = courses.length;
          this.recentCourses = courses.slice(0, 5).map((c: any) => ({
             id: c._id || c.id,
             title: c.title || c.name,
             instructor: c.instructor?.name || 'Unknown',
             status: c.status || 'Published',
             studentsCount: c.enrolledStudents?.length || 0,
             rating: c.rating || 0
          }));
       },
       error: (err) => console.error(err)
    });

    this.adminService.getAllInstructors().subscribe({
       next: (res: any) => {
          const insts = res.data || res || [];
          this.stats.totalInstructors = insts.length;
       },
       error: (err) => console.error(err)
    });

    // You can fetch Admin Profile or Activities if your API supports it
    // For now we will just hide activities since there is no backend route for it.

    this.loading = false;
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
      case 'User': return '♙';
      case 'Course': return '▣';
      case 'Enrollment': return '↗';
      case 'Certificate': return '✪';
      default: return '•';
    }
  }

  getCourseStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }
}