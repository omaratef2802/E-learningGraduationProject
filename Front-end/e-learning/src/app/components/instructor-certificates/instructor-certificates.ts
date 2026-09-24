import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  InstructorData,
  Certificate
} from '../../page/instructor-data';

import { InstructorSidebar } from '../../page/instructor-sidebar/sidebar';

@Component({
  selector: 'app-instructor-certificates',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    InstructorSidebar
  ],

  templateUrl: './instructor-certificates.html',
  styleUrl: './instructor-certificates.css'
})
export class InstructorCertificatesComponent
  implements OnInit {


  // =========================================================
  // DATA
  // =========================================================

  constructor(
    public data: InstructorData,
    private router: Router
  ) {}


  // =========================================================
  // CERTIFICATES
  // =========================================================

  certificates: Certificate[] = [];

  filteredCertificates: Certificate[] = [];


  // =========================================================
  // FILTERS
  // =========================================================

  searchText = '';

  selectedCourse = 'all';

  selectedStatus = 'all';

  courses: string[] = [];


  // =========================================================
  // PAGE STATE
  // =========================================================

  loading = false;

  errorMessage = '';


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.loadCertificates();

  }


  // =========================================================
  // LOAD CERTIFICATES
  // =========================================================

  loadCertificates(): void {

    try {

      this.loading = true;

      this.errorMessage = '';


      // Get certificates from InstructorData
      this.certificates = [
        ...this.data.certificates
      ];


      // Get unique course names
      this.courses = [
        ...new Set(
          this.certificates.map(
            certificate =>
              certificate.courseTitle
          )
        )
      ];


      // Apply filters
      this.applyFilters();


      this.loading = false;

    } catch (error: any) {

      console.error(
        'Certificates Error:',
        error
      );

      this.errorMessage =
        'Unable to load certificates.';

      this.loading = false;

    }

  }


  // =========================================================
  // APPLY FILTERS
  // =========================================================

  applyFilters(): void {

    const search =
      this.searchText
        .toLowerCase()
        .trim();


    this.filteredCertificates =
      this.certificates.filter(
        certificate => {


          // ---------------------------------
          // SEARCH
          // ---------------------------------

          const studentName =
            certificate.studentName
              .toLowerCase();


          const studentEmail =
            certificate.studentEmail
              .toLowerCase();


          const courseTitle =
            certificate.courseTitle
              .toLowerCase();


          const certificateId =
            certificate.certId
              .toLowerCase();


          const matchesSearch =
            !search ||

            studentName.includes(search) ||

            studentEmail.includes(search) ||

            courseTitle.includes(search) ||

            certificateId.includes(search);


          // ---------------------------------
          // COURSE FILTER
          // ---------------------------------

          const matchesCourse =
            this.selectedCourse === 'all' ||

            certificate.courseTitle ===
              this.selectedCourse;


          // ---------------------------------
          // STATUS FILTER
          // ---------------------------------

          const matchesStatus =
            this.selectedStatus === 'all' ||

            certificate.status ===
              this.selectedStatus;


          // ---------------------------------
          // FINAL RESULT
          // ---------------------------------

          return (
            matchesSearch &&
            matchesCourse &&
            matchesStatus
          );

        }
      );

  }


  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  clearFilters(): void {

    this.searchText = '';

    this.selectedCourse = 'all';

    this.selectedStatus = 'all';

    this.applyFilters();

  }


  // =========================================================
  // GET STUDENT NAME
  // =========================================================

  getStudentName(
    certificate: Certificate
  ): string {

    return certificate.studentName;

  }


  // =========================================================
  // GET STUDENT INITIALS
  // =========================================================

  getStudentInitials(
    certificate: Certificate
  ): string {

    return certificate.studentInitials;

  }


  // =========================================================
  // VIEW CERTIFICATE
  // =========================================================

  viewCertificate(
    certificate: Certificate
  ): void {

    this.router.navigate([
      '/certificate',
      certificate.id
    ]);

  }


  // =========================================================
  // OPEN PROFILE
  // =========================================================

  openProfile(): void {

    this.router.navigate([
      '/instructor-profile'
    ]);

  }


  // =========================================================
  // EXPORT RECORDS
  // =========================================================

  exportRecords(): void {

    if (
      this.filteredCertificates.length === 0
    ) {

      return;

    }


    // Prepare rows
    const rows =
      this.filteredCertificates.map(
        certificate => ({

          Certificate_ID:
            certificate.certId,

          Student:
            certificate.studentName,

          Email:
            certificate.studentEmail,

          Course:
            certificate.courseTitle,

          Completion:
            `${certificate.completionRate}%`,

          Issued_Date:
            certificate.issuedDate,

          Status:
            certificate.status

        })
      );


    // Headers
    const headers =
      Object.keys(rows[0]);


    // CSV content
    const csv = [

      headers.join(','),

      ...rows.map(row =>

        headers
          .map(
            header =>
              `"${String(
                row[
                  header as keyof typeof row
                ]
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(',')

      )

    ].join('\n');


    // Create file
    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );


    // Create URL
    const url =
      window.URL.createObjectURL(blob);


    // Create download link
    const link =
      document.createElement('a');


    link.href = url;

    link.download =
      'instructor-certificates.csv';


    // Download
    link.click();


    // Cleanup
    window.URL.revokeObjectURL(url);

  }


  // =========================================================
  // ADD CERTIFICATE
  // =========================================================

  addCertificate(
    certificate: Omit<Certificate, 'id'>
  ): void {

    this.data.addCertificate(
      certificate
    );

    this.loadCertificates();

  }


  // =========================================================
  // UPDATE CERTIFICATE
  // =========================================================

  updateCertificate(
    id: string,
    updates: Partial<Certificate>
  ): void {

    this.data.updateCertificate(
      id,
      updates
    );

    this.loadCertificates();

  }


  // =========================================================
  // DELETE CERTIFICATE
  // =========================================================

  removeCertificate(
    id: string
  ): void {

    this.data.removeCertificate(
      id
    );

    this.loadCertificates();

  }


  // =========================================================
  // GET CERTIFICATE BY ID
  // =========================================================

  getCertificate(
    id: string
  ): Certificate | undefined {

    return this.data.getCertificate(
      id
    );

  }


  // =========================================================
  // COUNTS
  // =========================================================

  getTotalCertificates(): number {

    return this.filteredCertificates.length;

  }


  getIssuedCertificates(): number {

    return this.filteredCertificates.filter(
      certificate =>
        certificate.status === 'Issued'
    ).length;

  }


  getPendingCertificates(): number {

    return this.filteredCertificates.filter(
      certificate =>
        certificate.status === 'Pending'
    ).length;

  }


  getRevokedCertificates(): number {

    return this.filteredCertificates.filter(
      certificate =>
        certificate.status === 'Revoked'
    ).length;

  }

}