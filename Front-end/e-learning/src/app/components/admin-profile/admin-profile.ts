import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  InstructorData,
  AdminProfile as AdminProfileModel
} from '../../page/instructor-data';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';


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

  public readonly data =
    inject(InstructorData);


  profile: AdminProfileModel = {
    firstName: '',
    lastName: '',
    role: ''
  };


  editing = false;

  savedMessage = '';


  ngOnInit(): void {

    this.loadProfile();

  }


  loadProfile(): void {

    this.profile = {
      ...this.data.admin
    };

  }


  startEditing(): void {

    this.savedMessage = '';

    this.profile = {
      ...this.data.admin
    };

    this.editing = true;

  }


  cancelEditing(): void {

    this.profile = {
      ...this.data.admin
    };

    this.editing = false;

    this.savedMessage = '';

  }


  saveProfile(): void {

    const firstName =
      this.profile.firstName.trim();

    const lastName =
      this.profile.lastName.trim();

    const role =
      this.profile.role.trim();


    if (
      !firstName ||
      !lastName ||
      !role
    ) {

      this.savedMessage =
        'Please complete all fields.';

      return;

    }


    this.data.updateAdminProfile({

      firstName,
      lastName,
      role

    });


    this.profile = {
      ...this.data.admin
    };


    this.editing = false;

    this.savedMessage =
      'Profile updated successfully.';

  }


  getFullName(): string {

    return `${this.data.admin.firstName} ${this.data.admin.lastName}`;

  }


  getInitials(): string {

    return (
      this.data.admin.firstName.charAt(0) +
      this.data.admin.lastName.charAt(0)
    ).toUpperCase();

  }

}