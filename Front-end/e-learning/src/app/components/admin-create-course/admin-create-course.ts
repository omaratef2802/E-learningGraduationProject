import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import {
  InstructorData,
  AdminUser
} from '../../page/instructor-data';

@Component({
  selector: 'app-admin-create-course',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl:
    './admin-create-course.html',

  styleUrl:
    './admin-create-course.css'
})
export class AdminCreateCourse
  implements OnInit {

  private readonly router =
    inject(Router);

  public readonly data =
    inject(InstructorData);

  instructors: AdminUser[] = [];

  categories: string[] = [];

  tracks: string[] = [];

  title = '';

  description = '';

  category = '';

  track = '';

  level = 'Beginner';

  language = 'English';

  price = '';

  duration = '';

  imageUrl =
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85';

  objectives = '';

  prerequisites = '';

  selectedInstructorId = '';

  loading = false;

  submitted = false;

  errorMessage = '';

  ngOnInit(): void {

    this.instructors =
      this.data.getAdminInstructors();

    this.categories =
      this.data
        .getAdminCategories()
        .filter(
          category =>
            category.status === 'Active'
        )
        .map(
          category =>
            category.name
        );

    if (this.categories.length) {
      this.category =
        this.categories[0];

      this.updateTracks();
    }
  }

  updateTracks(): void {

    this.tracks =
      this.data
        .getAdminTracks()
        .filter(
          track =>
            track.category ===
            this.category &&
            track.status === 'Active'
        )
        .map(
          track =>
            track.name
        );

    this.track =
      this.tracks[0] || '';
  }

  onCategoryChange(): void {
    this.updateTracks();
  }

  createCourse(): void {

    this.submitted = true;

    this.errorMessage = '';

    if (
      !this.title.trim() ||
      !this.description.trim() ||
      !this.category ||
      !this.selectedInstructorId
    ) {
      this.errorMessage =
        'Please complete all required fields.';

      return;
    }

    const instructor =
      this.instructors.find(
        item =>
          item.id ===
          this.selectedInstructorId
      );

    if (!instructor) {
      this.errorMessage =
        'Please select a valid instructor.';

      return;
    }

    try {

      this.loading = true;

      const course =
        this.data.createCourseByAdmin({

          title:
            this.title.trim(),

          description:
            this.description.trim(),

          category:
            this.category,

          track:
            this.track,

          image:
            this.imageUrl,

          price:
            `$${this.price || '0'}`,

          students:
            '0',

          rating:
            '—',

          updated:
            'Just now',

          status:
            'Assigned',

          level:
            this.level,

          language:
            this.language,

          duration:
            this.duration,

          objectives:
            this.objectives.trim(),

          prerequisites:
            this.prerequisites.trim(),

          instructorId:
            instructor.id,

          instructorName:
            instructor.name,

          instructorEmail:
            instructor.email
        });

      this.loading = false;

      this.router.navigate(
        ['/admin-courses'],
        {
          queryParams: {
            created: course.id
          }
        }
      );

    } catch (error) {

      console.error(
        'Create Course Error:',
        error
      );

      this.loading = false;

      this.errorMessage =
        'Unable to create the course. Please try again.';
    }
  }

  cancel(): void {
    this.router.navigate([
      '/admin-courses'
    ]);
  }
}