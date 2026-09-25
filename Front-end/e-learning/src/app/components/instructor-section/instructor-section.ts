import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { InstructorData } from '../../page/instructor-data';
import { InstructorSidebar } from '../../page/instructor-sidebar/sidebar';

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
export class InstructorSection {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly data = inject(InstructorData);

  protected sectionId =
    this.route.snapshot.queryParamMap.get('section') || '';

  protected courseTitle =
    this.route.snapshot.queryParamMap.get('course') ||
    'Course Curriculum';

  protected title = '';

  constructor() {

    const existing = this.data.sections.find(
      section => section.id === this.sectionId
    );

    if (existing) {
      this.title = existing.title;
    }
  }

  saveSection(): void {

    const title =
      this.title.trim() || 'Untitled Section';

    if (this.sectionId) {

      const existing = this.data.sections.find(
        section => section.id === this.sectionId
      );

      if (!existing) {
        return;
      }

      this.data.updateSection(
        this.sectionId,
        {
          title: title,
          lessons: existing.lessons,
          quizzes: existing.quizzes
        }
      );

    } else {

      this.data.addSection({
        title: title,
        lessons: [],
        quizzes: []
      });
    }

    this.backToCurriculum();
  }

  backToCurriculum(): void {

    this.router.navigate(
      ['/instructor-course-curriculum'],
      {
        queryParams: {
          course: this.courseTitle
        }
      }
    );
  }
}