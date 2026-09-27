import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { InstructorData } from '../../page/instructor-data';

@Component({
  selector: 'app-instructor-course-preview',
  standalone: true,
  imports: [],
  templateUrl: './instructor-course-preview.html',
  styleUrl: './instructor-course-preview.css'
})
export class InstructorCoursePreview {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly data = inject(InstructorData);

  protected readonly courseTitle =
    this.route.snapshot.queryParamMap.get('course') || '';

  protected readonly course =
    this.data.courses.find(
      item => item.title === this.courseTitle
    ) || this.data.courses[0];

  get totalLessons(): number {
    return this.data.sections.reduce(
      (total, section) =>
        total + section.lessons.length,
      0
    );
  }

  get totalQuizzes(): number {
    return this.data.sections.reduce(
      (total, section) =>
        total + section.quizzes.length,
      0
    );
  }

  backToCurriculum(): void {
    this.router.navigate(
      ['/instructor-course-curriculum'],
      {
        queryParams: {
          course: this.course.title
        }
      }
    );
  }
}