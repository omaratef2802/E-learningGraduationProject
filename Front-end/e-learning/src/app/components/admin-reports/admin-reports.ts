import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { AdminService } from '../../services/admin.service';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

export interface AdminReport {
  month: string;
  users: number;
  enrollments: number;
  courses: number;
  certificates: number;
  revenue: number;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    AdminSidebar
  ],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css'
})
export class AdminReports implements OnInit {

  private adminService = inject(AdminService);

  reports: AdminReport[] = [];

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadReports();
  }

  // Load reports
  loadReports(): void {
    this.loading = true;
    this.errorMessage = '';

    // We don't have a specific report endpoint, so we fetch standard data to construct one month.
    let users = 0;
    let courses = 0;
    
    this.adminService.getAllUsers().subscribe({
       next: (u) => {
         users = u.length;
         this.buildReport(users, courses);
       },
       error: (err) => console.error(err)
    });
    
    this.adminService.getCourses().subscribe({
       next: (c) => {
         courses = c.length;
         this.buildReport(users, courses);
       },
       error: (err) => console.error(err)
    });
    
    this.loading = false;
  }
  
  private buildReport(users: number, courses: number) {
      this.reports = [
         {
            month: 'Current',
            users: users,
            courses: courses,
            enrollments: 0,
            certificates: 0,
            revenue: 0
         }
      ];
  }

  getReportCount(): number { return this.reports.length; }
  getLatestReport(): AdminReport | undefined { return this.reports.length === 0 ? undefined : this.reports[this.reports.length - 1]; }
  getLatestUsers(): number { return this.getLatestReport()?.users ?? 0; }
  getLatestEnrollments(): number { return this.getLatestReport()?.enrollments ?? 0; }
  getLatestCourses(): number { return this.getLatestReport()?.courses ?? 0; }
  getLatestCertificates(): number { return this.getLatestReport()?.certificates ?? 0; }
  getLatestRevenue(): number { return this.getLatestReport()?.revenue ?? 0; }
  getTotalUsers(): number { return this.getLatestUsers(); }
  getTotalEnrollments(): number { return this.reports.reduce((t, r) => t + r.enrollments, 0); }
  getTotalCourses(): number { return this.reports.reduce((t, r) => t + r.courses, 0); }
  getTotalCertificates(): number { return this.reports.reduce((t, r) => t + r.certificates, 0); }
  getTotalRevenue(): number { return this.reports.reduce((t, r) => t + r.revenue, 0); }
  getUsersGrowth(): number { return 0; }
  getEnrollmentGrowth(): number { return 0; }
  getRevenueGrowth(): number { return 0; }
  getCertificateGrowth(): number { return 0; }
  getMaxUsers(): number { return Math.max(...this.reports.map(r => r.users), 1); }
  getUserBarHeight(value: number): number { return Math.max((value / this.getMaxUsers()) * 100, 4); }
  getMaxRevenue(): number { return Math.max(...this.reports.map(r => r.revenue), 1); }
  getRevenueBarHeight(value: number): number { return Math.max((value / this.getMaxRevenue()) * 100, 4); }
  formatRevenue(value: number): string { return `$${value.toLocaleString()}`; }
  formatNumber(value: number): string { return value.toLocaleString(); }
}