import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CREATE_COURSE_CONFIG } from './create-course.config';
import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import { InstructorData } from '../instructor-data';

@Component({
  selector: 'app-instructor-create-course',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InstructorSidebar
  ],
  templateUrl: './create-course.html',
  styleUrl: './create-course.css',
})
export class InstructorCreateCourse {

  private readonly router = inject(Router);

  protected readonly data =
    inject(InstructorData);

  protected readonly config =
    CREATE_COURSE_CONFIG;

  protected activeNav = 'Create Course';

  protected title =
    'Full-Stack Web Development with React & Node.js';

  protected description =
    'Master frontend engineering, state flow management, scalable RESTful architecture, and end-to-end database integrations through production-ready real-world exercises.';

  protected category =
    'Web Development';

  protected subcategory =
    'Frontend Engineering';

  protected track =
    'Full-Stack Development';

  protected level =
    'Intermediate';

  protected price =
    '79.99';

  protected duration =
    '24 hours (36 lessons)';

  protected language =
    'English';

  protected objectives =
    '';

  protected prerequisites =
    '';

  protected imageUrl =
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=85';

  protected imageName =
    'Preview Image Banner';

  protected get categoryOptions() {

    return this.config.options[
      this.category as keyof typeof this.config.options
    ];
  }

  onCategoryChange(): void {

    const options =
      this.categoryOptions;

    this.subcategory =
      options.subcategories[0];

    this.track =
      options.tracks[0];

    this.level =
      options.levels[0];

    this.duration =
      options.durations[0];
  }

  onSubcategoryChange(): void {

    const matchingTrack =
      this.categoryOptions.tracks.find(
        track =>
          track
            .toLowerCase()
            .includes(
              this.subcategory
                .split(' ')[0]
                .toLowerCase()
            )
      );

    if (matchingTrack) {
      this.track =
        matchingTrack;
    }
  }

  onTrackChange(): void {

    if (
      this.track.includes('Advanced') &&
      this.categoryOptions.levels.length > 2
    ) {

      this.level =
        this.categoryOptions.levels[2];
    }
  }

  setActiveNav(item: string): void {

    this.activeNav =
      item;

    const routes:
      Record<string, string> = {

      Dashboard:
        '/instructor-dashboard',

      'My Courses':
        '/instructor-catalog',

      'Create Course':
        '/instructor-create-course',

      Students:
        '/students',

      Certificates:
        '/certificates',

      Notifications:
        '/instructor-notifications',

      Profile:
        '/instructor-profile'
    };

    const route =
      routes[item];

    if (route) {

      this.router.navigate([
        route
      ]);
    }
  }

  saveDraft(): void {

    const courseTitle =
      this.title.trim() ||
      'Untitled Course';

    this.data.addCourse({

      title:
        courseTitle,

      category:
        `${this.category} + ${this.track}`,

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
        'Draft'
    });

    this.router.navigate([
      '/instructor-catalog'
    ]);
  }

  createCourse(): void {

    const courseTitle =
      this.title.trim() ||
      'Untitled Course';

    this.data.addCourse({

      title:
        courseTitle,

      category:
        `${this.category} + ${this.track}`,

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
        'Draft'
    });
    
    // Clear the previous course sections mock data
    this.data.clearSections();

    this.router.navigate(
      ['/instructor-course-curriculum'],
      {
        queryParams: {
          course:
            courseTitle
        }
      }
    );
  }

  chooseImage(
    fileInput: HTMLInputElement
  ): void {

    fileInput.click();
  }

  onImageSelected(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    this.imageName =
      file.name;

    const reader =
      new FileReader();

    reader.onload = () => {

      this.imageUrl =
        String(reader.result);
    };

    reader.readAsDataURL(file);
  }

  removeImage(
    fileInput: HTMLInputElement
  ): void {

    this.imageUrl = '';

    this.imageName =
      'No image selected';

    fileInput.value = '';
  }
}