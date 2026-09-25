import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  InstructorData,
  AdminReport
} from '../../page/instructor-data';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

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

  public readonly data = inject(InstructorData);

  reports: AdminReport[] = [];

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadReports();
  }

  // Load reports from InstructorData
  loadReports(): void {
    try {
      this.loading = true;
      this.errorMessage = '';

      this.reports = this.data.getAdminReports();

      this.loading = false;
    } catch (error) {
      console.error('Admin Reports Error:', error);

      this.errorMessage = 'Unable to load reports.';
      this.loading = false;
    }
  }

  // Number of available reports
  getReportCount(): number {
    return this.reports.length;
  }

  // Latest report
  getLatestReport(): AdminReport | undefined {
    if (this.reports.length === 0) {
      return undefined;
    }

    return this.reports[this.reports.length - 1];
  }

  // Latest users
  getLatestUsers(): number {
    return this.getLatestReport()?.users ?? 0;
  }

  // Latest enrollments
  getLatestEnrollments(): number {
    return this.getLatestReport()?.enrollments ?? 0;
  }

  // Latest courses
  getLatestCourses(): number {
    return this.getLatestReport()?.courses ?? 0;
  }

  // Latest certificates
  getLatestCertificates(): number {
    return this.getLatestReport()?.certificates ?? 0;
  }

  // Latest revenue
  getLatestRevenue(): number {
    return this.getLatestReport()?.revenue ?? 0;
  }

  // Total users = latest users snapshot
  getTotalUsers(): number {
    return this.getLatestUsers();
  }

  // Total enrollments across all months
  getTotalEnrollments(): number {
    return this.reports.reduce(
      (total, report) => total + report.enrollments,
      0
    );
  }

  // Total courses across all months
  getTotalCourses(): number {
    return this.reports.reduce(
      (total, report) => total + report.courses,
      0
    );
  }

  // Total certificates across all months
  getTotalCertificates(): number {
    return this.reports.reduce(
      (total, report) => total + report.certificates,
      0
    );
  }

  // Total revenue across all months
  getTotalRevenue(): number {
    return this.reports.reduce(
      (total, report) => total + report.revenue,
      0
    );
  }

  // Users growth
  getUsersGrowth(): number {
    if (this.reports.length < 2) {
      return 0;
    }

    const previous =
      this.reports[this.reports.length - 2].users;

    const current =
      this.reports[this.reports.length - 1].users;

    return this.calculateGrowth(previous, current);
  }

  // Enrollments growth
  getEnrollmentGrowth(): number {
    if (this.reports.length < 2) {
      return 0;
    }

    const previous =
      this.reports[this.reports.length - 2].enrollments;

    const current =
      this.reports[this.reports.length - 1].enrollments;

    return this.calculateGrowth(previous, current);
  }

  // Revenue growth
  getRevenueGrowth(): number {
    if (this.reports.length < 2) {
      return 0;
    }

    const previous =
      this.reports[this.reports.length - 2].revenue;

    const current =
      this.reports[this.reports.length - 1].revenue;

    return this.calculateGrowth(previous, current);
  }

  // Certificates growth
  getCertificateGrowth(): number {
    if (this.reports.length < 2) {
      return 0;
    }

    const previous =
      this.reports[this.reports.length - 2].certificates;

    const current =
      this.reports[this.reports.length - 1].certificates;

    return this.calculateGrowth(previous, current);
  }

  // Calculate percentage growth
  private calculateGrowth(
    previous: number,
    current: number
  ): number {

    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return Math.round(
      ((current - previous) / previous) * 100
    );
  }

  // Maximum users value for chart
  getMaxUsers(): number {
    return Math.max(
      ...this.reports.map(report => report.users),
      1
    );
  }

  // User chart bar height
  getUserBarHeight(value: number): number {
    const max = this.getMaxUsers();

    return Math.max(
      (value / max) * 100,
      4
    );
  }

  // Maximum revenue value for chart
  getMaxRevenue(): number {
    return Math.max(
      ...this.reports.map(report => report.revenue),
      1
    );
  }

  // Revenue chart bar height
  getRevenueBarHeight(value: number): number {
    const max = this.getMaxRevenue();

    return Math.max(
      (value / max) * 100,
      4
    );
  }

  // Format revenue
  formatRevenue(value: number): string {
    return `$${value.toLocaleString()}`;
  }

  // Format numbers
  formatNumber(value: number): string {
    return value.toLocaleString();
  }
}