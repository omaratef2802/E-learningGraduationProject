import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { StudentCertificate, StudentLearningService } from '../../services/student-learning.service';
import { StudentSidebar } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-student-certificates',
  standalone: true,
  imports: [CommonModule, RouterLink, StudentSidebar],
  templateUrl: './student-certificates.html',
  styleUrl: './student-certificates.css',
})
export class StudentCertificates implements OnInit {
  private readonly learning = inject(StudentLearningService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  certificates: StudentCertificate[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.learning.getMyCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'We could not load your certificates. Please sign in again.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  verificationLink(certificate: StudentCertificate): string {
    return `http://localhost:3000/E-learning/certificate/verify/${encodeURIComponent(certificate.certificateId)}`;
  }
}
