import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { StudentProfile, StudentLearningService } from '../../services/student-learning.service';
import { StudentSidebar } from '../student-sidebar/student-sidebar';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StudentSidebar],
  templateUrl: './student-profile.html',
  styleUrl: './student-profile.css',
})
export class StudentProfilePage implements OnInit {
  private readonly learning = inject(StudentLearningService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  profile: StudentProfile | null = null;
  firstName = '';
  lastName = '';
  phone = '';
  dateBirth = '';
  bio = '';
  loading = true;
  saving = false;
  editing = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.errorMessage = '';
    this.learning.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.copyProfileToForm();
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'We could not load your profile. Please sign in again.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  beginEdit(): void {
    this.copyProfileToForm();
    this.successMessage = '';
    this.errorMessage = '';
    this.editing = true;
  }

  cancelEdit(): void {
    this.copyProfileToForm();
    this.editing = false;
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.errorMessage = 'First name and last name are required.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.learning.updateMyProfile({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      phone: this.phone.trim(),
      dateBirth: this.dateBirth || '',
      bio: this.bio.trim(),
    }).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.copyProfileToForm();
        this.editing = false;
        this.saving = false;
        this.successMessage = 'Your profile has been updated.';
        this.changeDetector.markForCheck();
      },
      error: (error) => {
        this.saving = false;
        this.errorMessage = error.error?.message || 'We could not save your changes. Please try again.';
        this.changeDetector.markForCheck();
      },
    });
  }

  get initials(): string {
    const first = this.profile?.firstName?.trim().charAt(0) || 'S';
    const last = this.profile?.lastName?.trim().charAt(0) || '';
    return `${first}${last}`.toUpperCase();
  }

  private copyProfileToForm(): void {
    this.firstName = this.profile?.firstName || '';
    this.lastName = this.profile?.lastName || '';
    this.phone = this.profile?.phone || '';
    this.dateBirth = this.profile?.dateBirth ? this.profile.dateBirth.slice(0, 10) : '';
    this.bio = this.profile?.bio || '';
  }
}
