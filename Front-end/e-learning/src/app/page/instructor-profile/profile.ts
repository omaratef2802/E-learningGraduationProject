import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import { InstructorData } from '../instructor-data';

@Component({
  selector: 'app-instructor-profile',
  standalone: true,
  imports: [
    CommonModule,
    InstructorSidebar,
    FormsModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class InstructorProfile {

  private readonly router = inject(Router);

  protected readonly data =
    inject(InstructorData);

  protected editing = false;

  protected firstName =
    this.data.instructor.firstName;

  protected lastName =
    this.data.instructor.lastName;

  protected bio =
    this.data.instructor.bio;

  protected editableSkills: string[] = [
    ...this.data.instructor.skills
  ];

  protected newSkill = '';

  protected saveMessage = '';

  protected imagePreview =
    this.data.instructor.image;

  protected readonly defaultImage =
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=85';


  // =========================
  // EDIT
  // =========================

  toggleEdit(): void {

    if (this.editing) {

      this.loadCurrentProfile();

      this.editing = false;

      this.saveMessage = '';

      return;
    }

    this.loadCurrentProfile();

    this.editing = true;

    this.saveMessage = '';
  }


  private loadCurrentProfile(): void {

    this.firstName =
      this.data.instructor.firstName;

    this.lastName =
      this.data.instructor.lastName;

    this.bio =
      this.data.instructor.bio;

    this.editableSkills = [
      ...this.data.instructor.skills
    ];

    this.imagePreview =
      this.data.instructor.image;
  }


  // =========================
  // IMAGE
  // =========================

  chooseImage(
    fileInput: HTMLInputElement
  ): void {

    fileInput.click();
  }


  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {

      this.saveMessage =
        'Please select a valid image file.';

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imagePreview =
        String(reader.result);

      this.saveMessage = '';
    };

    reader.readAsDataURL(file);
  }


  removeImage(
    fileInput: HTMLInputElement
  ): void {

    this.imagePreview =
      this.defaultImage;

    fileInput.value = '';

    this.saveMessage = '';
  }


  // =========================
  // SKILLS
  // =========================

  addSkill(): void {

    const skill =
      this.newSkill.trim();

    if (!skill) return;

    const exists =
      this.editableSkills.some(
        item =>
          item.toLowerCase() ===
          skill.toLowerCase()
      );

    if (exists) {

      this.newSkill = '';

      return;
    }

    this.editableSkills.push(skill);

    this.newSkill = '';
  }


  removeSkill(index: number): void {

    this.editableSkills.splice(
      index,
      1
    );
  }


  // =========================
  // SAVE
  // =========================

  saveProfile(): void {

    if (
      !this.firstName.trim() ||
      !this.lastName.trim()
    ) {

      this.saveMessage =
        'First name and last name are required.';

      return;
    }

    this.data.updateInstructor({

      firstName:
        this.firstName.trim(),

      lastName:
        this.lastName.trim(),

      bio:
        this.bio.trim(),

      skills:
        [...this.editableSkills],

      image:
        this.imagePreview

    });

    this.editing = false;

    this.saveMessage =
      'Profile updated successfully.';
  }


  // =========================
  // NOTIFICATIONS
  // =========================

  openNotifications(): void {

    this.router.navigate([
      '/instructor-notifications'
    ]);
  }
}