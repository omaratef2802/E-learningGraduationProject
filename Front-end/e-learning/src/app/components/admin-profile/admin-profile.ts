import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../services/admin.service';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

export interface AdminProfileModel {
  firstName: string;
  lastName: string;
  role: string;
  id?: string;
}

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css',
})
export class AdminProfile implements OnInit {

  private adminService = inject(AdminService);

  profile: AdminProfileModel = {
    firstName: '',
    lastName: '',
    role: 'admin'
  };

  originalProfile: AdminProfileModel = {
    firstName: '',
    lastName: '',
    role: 'admin'
  };

  editing = false;
  savedMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    // Attempt to load the current admin profile from the API
    this.adminService.getCurrentAdminProfile().subscribe({
       next: (response: any) => {
         const admin = response?.data ?? response;
         if (admin) {
           this.profile = {
             id: admin._id || admin.id,
             firstName: admin.firstName || admin.username || 'Admin',
             lastName: admin.lastName || '',
             role: admin.role || 'admin'
           };
           this.originalProfile = { ...this.profile };
         }
       },
       error: (err) => {
         console.error(err);
         this.errorMessage = 'Unable to load profile data.';
       }
    });
  }

  startEditing(): void {
    this.savedMessage = '';
    this.errorMessage = '';
    this.profile = { ...this.originalProfile };
    this.editing = true;
  }

  cancelEditing(): void {
    this.profile = { ...this.originalProfile };
    this.editing = false;
    this.savedMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    const firstName = this.profile.firstName.trim();
    const lastName = this.profile.lastName.trim();

    if (!firstName) {
      this.errorMessage = 'Please complete all fields.';
      return;
    }

    const payload = {
      firstName,
      lastName,
      // You can add email, username, etc. based on your schema
    };

      this.adminService.updateAdmin(payload).subscribe({
       next: (res: any) => {
          this.originalProfile = { ...this.profile };
          this.editing = false;
          this.savedMessage = 'Profile updated successfully.';
          this.errorMessage = '';
       },
       error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to update profile.';
       }
    });
  }

  getFullName(): string {
    return `${this.originalProfile.firstName} ${this.originalProfile.lastName}`.trim() || 'Admin User';
  }

  getInitials(): string {
    const first = this.originalProfile.firstName ? this.originalProfile.firstName.charAt(0) : 'A';
    const last = this.originalProfile.lastName ? this.originalProfile.lastName.charAt(0) : 'U';
    return (first + last).toUpperCase();
  }
}
