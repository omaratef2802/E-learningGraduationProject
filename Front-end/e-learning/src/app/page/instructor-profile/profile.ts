import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import { InstructorDataService } from '../../services/instructor-data.service';
import { InstructorProfile } from '../../mock-types';

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
/**
 * Named `InstructorProfilePage` in code because `InstructorProfile` is already
 * taken by the database model in mock-types.
 */
export class InstructorProfilePage implements OnInit {

  private readonly router = inject(Router);

  private readonly dataService = inject(InstructorDataService);

  /** The instructor record as stored in MongoDB (dbUsers). */
  protected profile: InstructorProfile | null = null;

  protected loading = false;

  protected editing = false;

  protected firstName = '';
  protected lastName = '';
  protected bio = '';
  protected editableSkills: string[] = [];
  protected newSkill = '';
  protected saveMessage = '';
  protected imagePreview = '';
  protected selectedImageFile: File | undefined;


  protected readonly defaultImage =
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=85';


  ngOnInit(): void {

    this.loading = true;

    this.dataService.getProfile().subscribe({

      next: (profile) => {

        this.profile = profile;

        this.loadCurrentProfile();

        this.loading = false;

      },

      error: (err) => {

        console.error('Error fetching profile:', err);

        this.saveMessage =
          'Unable to load your profile.';

        this.loading = false;

      },
    });
  }


  /**
 * The templates were written against the old mock store shape
 * (`data.instructor.*`). This keeps that contract working while the values
 * now come from the database.
 */
  protected get data(): {
    instructor: {
      firstName: string;
      lastName: string;
      image: string;
      role: string;
      bio: string;
      skills: string[];
    };
  } {
    const instructor = this.profile;

    return {
      instructor: {
        firstName: instructor?.firstName ?? '',
        lastName: instructor?.lastName ?? '',
        image: instructor?.img ?? this.defaultImage,
        role: instructor?.role ?? 'instructor',
        bio: instructor?.bio ?? '',
        skills: this.editableSkills,
      },
    };
  }


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

    const profile = this.profile;

    if (!profile) return;

    this.firstName = profile.firstName ?? '';
    this.lastName = profile.lastName ?? '';
    this.bio = profile.bio ?? '';
    this.imagePreview = profile.img || this.defaultImage;

    // verifiedSkills is a Mixed array, so entries may be strings or objects.
    this.editableSkills = (profile.verifiedSkills ?? [])
      .map((skill) => (typeof skill === 'string' ? skill : (skill as any)?.skill))
      .filter((skill): skill is string => typeof skill === 'string' && skill.length > 0);
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

    // PATCH /users/profile — the backend owns validation and persistence.
    this.dataService.updateProfile({
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      bio: this.bio.trim(),
      img:
        this.imagePreview === this.defaultImage
          ? null
          : this.imagePreview
    }).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.loadCurrentProfile();
        this.editing = false;
        this.saveMessage =
          'Profile updated successfully.';
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.saveMessage =
          err?.error?.message ||
          'Failed to update profile.';
      }
    });
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





