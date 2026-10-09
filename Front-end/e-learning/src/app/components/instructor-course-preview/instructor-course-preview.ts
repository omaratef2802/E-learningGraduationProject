import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { InstructorDataService } from '../../services/instructor-data.service';
import { Course, CurriculumSection, PopulatedUser } from '../../mock-types';

@Component({
  selector: 'app-instructor-course-preview',
  standalone: true,
  imports: [],
  templateUrl: './instructor-course-preview.html',
  styleUrl: './instructor-course-preview.css'
})
export class InstructorCoursePreview implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(InstructorDataService);

  protected readonly courseId =
    this.route.snapshot.queryParamMap.get('courseId') || '';
  protected readonly courseTitle =
    this.route.snapshot.queryParamMap.get('course') || '';

  /** The course record, loaded from the database. */
  protected course: Course | null = null;

  /** Sections with their nested lessons and quizzes. */
  protected sections: CurriculumSection[] = [];

  /**
   * The template reads `data.sections`; it is bound to the loaded curriculum
   * so the markup stays unchanged.
   */
  protected data = { sections: this.sections };

  ngOnInit(): void {
    if (!this.courseId) return;

    this.dataService.getCourse(this.courseId).subscribe({
      next: (course) => (this.course = course as Course),
      error: (err) => console.error('Error fetching course:', err),
    });

    this.dataService.getCurriculum(this.courseId).subscribe({
      next: (sections) => {
        this.sections = sections;
        this.data = { sections };
      },
      error: (err) => console.error('Error fetching curriculum:', err),
    });
  }

  get instructorName(): string {
    const instructor = this.course?.instructorId;

    if (instructor && typeof instructor === 'object') {
      const user = instructor as PopulatedUser;
      return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    }
    return '';
  }


  /** Display label for the database status value. */
  get statusLabel(): string {
    switch (this.course?.status) {
      case 'in_review':
        return 'In Review';
      case 'changes_required':
        return 'Changes Required';
      case 'published':
        return 'Published';
      case 'archived':
        return 'Archived';
      case 'draft':
        return 'Draft';
      default:
        return '';
    }
  }


  /** The category is stored as an id unless the backend populated it. */
  get categoryName(): string {
    const category = this.course?.category;
    return category && typeof category === 'object' ? category.name : '';
  }

  get totalLessons(): number {
    return this.sections.reduce(
      (total, section) => total + section.lessons.length,
      0
    );
  }

  get totalQuizzes(): number {
    return this.sections.reduce(
      (total, section) => total + section.quizzes.length,
      0
    );
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
