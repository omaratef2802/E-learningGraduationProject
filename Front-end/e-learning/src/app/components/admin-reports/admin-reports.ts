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
  styleUrl: './admin-reports.css',
})
export class AdminReports implements OnInit {

  // =========================================================
  // DATA SERVICE
  // =========================================================

  public readonly data =
    inject(InstructorData);


  // =========================================================
  // REPORTS
  // =========================================================

  reports: AdminReport[] = [];


  // =========================================================
  // PAGE STATE
  // =========================================================

  loading = false;

  errorMessage = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadReports();

  }


  // =========================================================
  // LOAD REPORTS
  // =========================================================

  loadReports(): void {

    try {

      this.loading = true;

      this.errorMessage = '';

      this.reports =
        this.data.getAdminReports();

      this.loading = false;

    } catch (error) {

      console.error(
        'Admin Reports Error:',
        error
      );

      this.errorMessage =
        'Unable to load reports.';

      this.loading = false;

    }

  }


  // =========================================================
  // TOTALS
  // =========================================================

  getTotalUsers(): number {

    return this.reports.reduce(
      (total, report) =>
        total + report.users,
      0
    );

  }


  getTotalEnrollments(): number {

    return this.reports.reduce(
      (total, report) =>
        total + report.enrollments,
      0
    );

  }


  getTotalCourses(): number {

    return this.reports.reduce(
      (total, report) =>
        total + report.courses,
      0
    );

  }


  getTotalCertificates(): number {

    return this.reports.reduce(
      (total, report) =>
        total + report.certificates,
      0
    );

  }


  getTotalRevenue(): number {

    return this.reports.reduce(
      (total, report) =>
        total + report.revenue,
      0
    );

  }


  // =========================================================
  // LATEST MONTH
  // =========================================================

  getLatestReport(): AdminReport | undefined {

    if (!this.reports.length) {
      return undefined;
    }

    return this.reports[
      this.reports.length - 1
    ];

  }


  getLatestUsers(): number {

    return this.getLatestReport()?.users ?? 0;

  }


  getLatestEnrollments(): number {

    return this.getLatestReport()?.enrollments ?? 0;

  }


  getLatestCourses(): number {

    return this.getLatestReport()?.courses ?? 0;

  }


  getLatestCertificates(): number {

    return this.getLatestReport()?.certificates ?? 0;

  }


  getLatestRevenue(): number {

    return this.getLatestReport()?.revenue ?? 0;

  }


  // =========================================================
  // GROWTH
  // =========================================================

  getUsersGrowth(): number {

    if (this.reports.length < 2) {
      return 0;
    }

    const previous =
      this.reports[
        this.reports.length - 2
      ].users;

    const current =
      this.reports[
        this.reports.length - 1
      ].users;

    return this.calculateGrowth(
      previous,
      current
    );

  }


  getEnrollmentGrowth(): number {

    if (this.reports.length < 2) {
      return 0;
    }

    const previous =
      this.reports[
        this.reports.length - 2
      ].enrollments;

    const current =
      this.reports[
        this.reports.length - 1
      ].enrollments;

    return this.calculateGrowth(
      previous,
      current
    );

  }


  getRevenueGrowth(): number {

    if (this.reports.length < 2) {
      return 0;
    }

    const previous =
      this.reports[
        this.reports.length - 2
      ].revenue;

    const current =
      this.reports[
        this.reports.length - 1
      ].revenue;

    return this.calculateGrowth(
      previous,
      current
    );

  }


  getCertificateGrowth(): number {

    if (this.reports.length < 2) {
      return 0;
    }

    const previous =
      this.reports[
        this.reports.length - 2
      ].certificates;

    const current =
      this.reports[
        this.reports.length - 1
      ].certificates;

    return this.calculateGrowth(
      previous,
      current
    );

  }


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


  // =========================================================
  // CHART HELPERS
  // =========================================================

  getMaxUsers(): number {

    return Math.max(
      ...this.reports.map(
        report => report.users
      ),
      1
    );

  }


  getMaxEnrollments(): number {

    return Math.max(
      ...this.reports.map(
        report => report.enrollments
      ),
      1
    );

  }


  getMaxRevenue(): number {

    return Math.max(
      ...this.reports.map(
        report => report.revenue
      ),
      1
    );

  }


  getUserBarHeight(
    value: number
  ): number {

    return (
      value / this.getMaxUsers()
    ) * 100;

  }


  getEnrollmentBarHeight(
    value: number
  ): number {

    return (
      value / this.getMaxEnrollments()
    ) * 100;

  }


  getRevenueBarHeight(
    value: number
  ): number {

    return (
      value / this.getMaxRevenue()
    ) * 100;

  }


  // =========================================================
  // FORMATTERS
  // =========================================================

  formatRevenue(
    value: number
  ): string {

    return `$${value.toLocaleString()}`;

  }


  formatNumber(
    value: number
  ): string {

    return value.toLocaleString();

  }

}