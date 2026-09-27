import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { InstructorData } from '../../page/instructor-data';
import { InstructorSidebar } from '../../page/instructor-sidebar/sidebar';
import { InstructorService } from '../../services/instructor.service';

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
  private readonly instructorService = inject(InstructorService);

  protected sectionId =
    this.route.snapshot.queryParamMap.get('section') || '';

  protected courseTitle = this.route.snapshot.queryParamMap.get('course') || 'Course Curriculum';
  protected courseId = this.route.snapshot.queryParamMap.get('courseId') || '';

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
    const title = this.title.trim() || 'Untitled Section';

    if (this.sectionId) {
      // Editing not fully implemented via API yet in this snippet, falling back to mock logic temporarily
      // Ideally you'd call this.instructorService.updateSection(...)
      const existing = this.data.sections.find(section => section.id === this.sectionId);
      if (!existing) return;

      this.data.updateSection(this.courseId, this.sectionId, {
        title: title,
        lessons: existing.lessons,
        quizzes: existing.quizzes
      });
      this.backToCurriculum();
    } else {
      // Create new section via API
      this.instructorService.createSection(this.courseId, { title, order: this.data.sections.length + 1 }).subscribe({
        next: (res: any) => {
          // Add to mock data so UI updates
          this.data.addSection(this.courseId, {
            id: res.data?._id || res.data?.id,
            title: title,
            lessons: [],
            quizzes: []
          } as any);
          this.backToCurriculum();
        },
        error: (err) => {
          console.error('Failed to create section:', err);
          alert('Failed to add section. Make sure Course ID is valid.');
        }
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