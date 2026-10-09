import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { InstructorSidebar } from '../../page/instructor-sidebar/sidebar';
import { InstructorDataService } from '../../services/instructor-data.service';
import { CurriculumSection } from '../../mock-types';

@Component({
  selector: 'app-instructor-section',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    InstructorSidebar
  ],
  templateUrl: './instructor-section.html',
  styleUrl: './instructor-section.css'
})
export class InstructorSection implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly dataService = inject(InstructorDataService);

  protected sectionId =
    this.route.snapshot.queryParamMap.get('section') || '';

  protected courseTitle = this.route.snapshot.queryParamMap.get('course') || 'Course Curriculum';
  protected courseId = this.route.snapshot.queryParamMap.get('courseId') || '';

  protected title = '';

  /** Sections of this course, loaded from the database. */
  protected sections: CurriculumSection[] = [];

  protected loading = false;
  protected saving = false;
  protected sectionsLoaded = false;
  protected errorMessage = '';

  ngOnInit(): void {
    if (!this.courseId) {
      this.errorMessage = 'Course information is missing. Return to My Courses and open the course again.';
      return;
    }

    this.loading = true;

    this.dataService.getCurriculum(this.courseId).subscribe({
      next: (sections) => {
        this.sections = sections;
        this.prefillTitle();
        this.sectionsLoaded = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching sections:', err);
        this.errorMessage = err?.error?.message || 'Could not load the course sections. Reload this page before adding a section.';
        this.loading = false;
      },
    });
  }

  private prefillTitle(): void {
    if (!this.sectionId) return;

    const existing = this.sections.find(
      (section) => section.id === this.sectionId
    );

    if (existing) {
      this.title = existing.title;
    }
  }

  saveSection(): void {
    const title = this.title.trim();
    this.errorMessage = '';

    if (!this.courseId) {
      this.errorMessage = 'Course information is missing. Return to My Courses and open the course again.';
      return;
    }
    if (!this.sectionsLoaded) {
      this.errorMessage = 'The current section list has not loaded. Reload the page before saving to avoid duplicate section order.';
      return;
    }
    if (!title) {
      this.errorMessage = 'Enter a title for this section.';
      return;
    }
    this.saving = true;

    if (this.sectionId) {
      // PATCH /section/:id
      this.dataService.updateSection(this.sectionId, { title }).subscribe({
        next: () => { this.saving = false; this.backToCurriculum(); },
        error: (err) => {
          console.error('Failed to update section:', err);
          this.saving = false;
          this.errorMessage = err?.error?.message || 'Failed to update section.';
        },
      });
    } else {
      // POST /section/course/:courseId — order is required by the backend.
      const order = this.sections.reduce((highest, section) => Math.max(highest, Number(section.order) || 0), 0) + 1;

      this.dataService.createSection(this.courseId, { title, order }).subscribe({
        next: () => { this.saving = false; this.backToCurriculum(); },
        error: (err) => {
          console.error('Failed to create section:', err);
          this.saving = false;
          this.errorMessage = err?.error?.message || 'Failed to add section. Check your connection and try again.';
        },
      });
    }
  }

  backToCurriculum(): void {
    this.router.navigate(
      ['/instructor-course-curriculum'],
      {
        queryParams: {
          course: this.courseTitle,
          courseId: this.courseId
        }
      }
    );
  }
}


