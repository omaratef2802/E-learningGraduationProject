import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideX,
  lucideShieldCheck,
  lucideCopy,
  lucideCheck,
  lucideCheckCircle2,
  lucideAward,
  lucideExternalLink,
  lucideGraduationCap
} from '@ng-icons/lucide';
import { CertificateItem } from '../../certificates.model';

@Component({
  selector: 'app-certificate-drawer',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucideX,
      lucideShieldCheck,
      lucideCopy,
      lucideCheck,
      lucideCheckCircle2,
      lucideAward,
      lucideExternalLink,
      lucideGraduationCap
    })
  ],
  templateUrl: './certificate-drawer.html',
  styleUrl: './certificate-drawer.css'
})
export class CertificateDrawerComponent {
  @Input() certificate: CertificateItem | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() viewDocument = new EventEmitter<CertificateItem>();

  readonly copied = signal(false);

  onClose(): void {
    this.close.emit();
  }

  onViewDocument(): void {
    if (this.certificate) {
      this.viewDocument.emit(this.certificate);
    }
  }

  copyCertificateId(id: string): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      });
    }
  }
}
