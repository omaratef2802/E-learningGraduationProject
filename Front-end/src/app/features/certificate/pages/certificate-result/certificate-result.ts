import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ICertificateData } from '../../../quiz/models';
import { MOCK_CERTIFICATE } from '../../../quiz/quiz-data';

@Component({
  selector: 'app-certificate-result',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './certificate-result.html',
  styleUrl: './certificate-result.css',
})
export class CertificateResult implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  certificate = signal<ICertificateData>(MOCK_CERTIFICATE);

  ngOnInit(): void {
    const qParams = this.route.snapshot.queryParams;
    if (qParams['score']) {
      const parsedScore = parseInt(qParams['score'], 10);
      this.certificate.update((prev) => ({
        ...prev,
        score: parsedScore,
        grade: parsedScore >= 90 ? 'Distinction' : parsedScore >= 80 ? 'Merit' : 'Pass',
      }));
    }
  }

  returnToLearning(): void {
    this.router.navigate(['/courses/6aadbda18bcef3360dc2dd']);
  }
}
