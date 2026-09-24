import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight
} from '@ng-icons/lucide';
import { CertificateDrawerComponent } from './components/certificate-drawer/certificate-drawer';
import { CertificateItem } from './certificates.model';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, CertificateDrawerComponent],
  providers: [
    provideIcons({
      lucideSearch,
      lucideChevronDown,
      lucideChevronLeft,
      lucideChevronRight
    })
  ],
  templateUrl: './certificates.html',
  styleUrl: './certificates.css'
})
export class CertificatesComponent {
  // Search and filter signals
  readonly searchQuery = signal('');
  readonly selectedCourse = signal('All Courses');
  readonly selectedStatus = signal('All');

  // Drawer state
  readonly isDrawerOpen = signal(false);
  readonly selectedCertificate = signal<CertificateItem | null>(null);

  // Pagination state (6 items per page)
  readonly pageSize = signal(6);
  readonly currentPage = signal(1);

  // Certificate Data matching reference image
  readonly certificates = signal<CertificateItem[]>([
    {
      id: 'cert-1',
      studentName: 'Naema Sayed',
      studentEmail: 'naema.learner@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      certificateId: 'PED-2026-FSWD-9842',
      courseTitle: 'Full-Stack Web Development',
      completionDate: 'Sep 18, 2026',
      formattedDate: 'September 18, 2026',
      finalScore: 92,
      grade: 'Grade: A',
      status: 'Verified',
      learnerId: '#L-9042',
      endorsementText: 'This credential certifies that the student has completed all module assessments, code reviews, and capstone requirements with distinction under instructor supervision.'
    },
    {
      id: 'cert-2',
      studentName: 'Ahmed Hassan',
      studentEmail: 'ahmed.hassan@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      certificateId: 'PED-2026-RFD-8821',
      courseTitle: 'React Frontend Development',
      completionDate: 'Sep 15, 2026',
      formattedDate: 'September 15, 2026',
      finalScore: 88,
      grade: 'Grade: B+',
      status: 'Verified',
      learnerId: '#L-8821',
      endorsementText: 'This credential certifies that the student has completed all module assessments, code reviews, and capstone requirements with distinction under instructor supervision.'
    },
    {
      id: 'cert-3',
      studentName: 'Sara Ali',
      studentEmail: 'sara.ali@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      certificateId: 'PED-2026-NDEX-7740',
      courseTitle: 'Node.js & Express Backend',
      completionDate: 'Sep 12, 2026',
      formattedDate: 'September 12, 2026',
      finalScore: 95,
      grade: 'Grade: A+',
      status: 'Verified',
      learnerId: '#L-7740',
      endorsementText: 'This credential certifies that the student has completed all module assessments, code reviews, and capstone requirements with distinction under instructor supervision.'
    },
    {
      id: 'cert-4',
      studentName: 'Omar Farooq',
      studentEmail: 'omar.farooq@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      certificateId: 'PED-2026-FSWD-6619',
      courseTitle: 'Full-Stack Web Development',
      completionDate: 'Aug 30, 2026',
      formattedDate: 'August 30, 2026',
      finalScore: 90,
      grade: 'Grade: A',
      status: 'Verified',
      learnerId: '#L-6619',
      endorsementText: 'This credential certifies that the student has completed all module assessments, code reviews, and capstone requirements with distinction under instructor supervision.'
    },
    {
      id: 'cert-5',
      studentName: 'David Miller',
      studentEmail: 'david.miller@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      certificateId: 'PED-2026-FSWD-5514',
      courseTitle: 'Full-Stack Web Development',
      completionDate: 'Aug 22, 2026',
      formattedDate: 'August 22, 2026',
      finalScore: 94,
      grade: 'Grade: A',
      status: 'Verified',
      learnerId: '#L-5514',
      endorsementText: 'This credential certifies that the student has completed all module assessments, code reviews, and capstone requirements with distinction under instructor supervision.'
    },
    {
      id: 'cert-6',
      studentName: 'Layla Mahmoud',
      studentEmail: 'layla.mahmoud@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      certificateId: 'PED-2026-RFD-4402',
      courseTitle: 'React Frontend Development',
      completionDate: 'Aug 14, 2026',
      formattedDate: 'August 14, 2026',
      finalScore: 89,
      grade: 'Grade: B+',
      status: 'Verified',
      learnerId: '#L-4402',
      endorsementText: 'This credential certifies that the student has completed all module assessments, code reviews, and capstone requirements with distinction under instructor supervision.'
    }
  ]);

  // Dynamic filter options
  readonly availableCourses = computed(() => [
    'All Courses',
    ...new Set(this.certificates().map(c => c.courseTitle))
  ]);

  readonly availableStatuses = computed(() => [
    'All',
    ...new Set(this.certificates().map(c => c.status))
  ]);

  // Filtered certificates list
  readonly filteredCertificates = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const course = this.selectedCourse();
    const status = this.selectedStatus();

    return this.certificates().filter(cert => {
      // Course filter
      if (course !== 'All Courses' && cert.courseTitle !== course) {
        return false;
      }

      // Status filter
      if (status !== 'All' && cert.status !== status) {
        return false;
      }

      // Search query
      if (query) {
        const matchesName = cert.studentName.toLowerCase().includes(query);
        const matchesEmail = cert.studentEmail.toLowerCase().includes(query);
        const matchesCertId = cert.certificateId.toLowerCase().includes(query);
        const matchesCourse = cert.courseTitle.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesCertId || matchesCourse;
      }

      return true;
    });
  });

  // Total pages
  readonly totalPages = computed(() => {
    const total = this.filteredCertificates().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  // Paginated certificates slice
  readonly paginatedCertificates = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredCertificates().slice(start, start + this.pageSize());
  });

  // Pagination display text
  readonly paginationText = computed(() => {
    const total = this.filteredCertificates().length;
    if (total === 0) return 'Showing 0 to 0 of 0 certificates';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), total);
    return `Showing ${start} to ${end} of ${total} certificates`;
  });

  // Open details drawer
  viewCertificate(certificate: CertificateItem): void {
    this.selectedCertificate.set(certificate);
    this.isDrawerOpen.set(true);
  }

  // Close details drawer
  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  onViewDocument(certificate: CertificateItem): void {
    console.log('Viewing certificate document for:', certificate.certificateId);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }
}
