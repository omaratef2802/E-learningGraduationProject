import { Component, signal,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ICourseDetails,
  ILesson,
  IRelatedCourse,
  IReview,
  ISection,
} from '../../models';
import {
  MOCK_COURSE,
  MOCK_LESSONS,
  MOCK_RELATED_COURSES,
  MOCK_REVIEWS,
  MOCK_SECTIONS,
} from '../../mock-data';
import { CourseHeaderComponent } from '../../components/course-header/course-header';
import { CourseOutcomesComponent } from '../../components/course-outcomes/course-outcomes';
import { CourseCurriculum } from '../../components/course-curriculum/course-curriculum';
import { CourseInstructorComponent } from '../../components/course-instructor/course-instructor';
import { CourseRequirementsComponent } from '../../components/course-requirements/course-requirements';
import { CourseReviewsComponent } from '../../components/course-reviews/course-reviews';
import { CourseRelatedComponent } from '../../components/course-related/course-related';
import { CourseSidebarComponent } from '../../components/course-sidebar/course-sidebar';
import { Router } from '@angular/router';
import { CourseProgressService } from '../../course-progress';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [
    CommonModule,
    CourseHeaderComponent,
    CourseOutcomesComponent,
    CourseCurriculum,
    CourseInstructorComponent,
    CourseRequirementsComponent,
    CourseReviewsComponent,
    CourseRelatedComponent,
    CourseSidebarComponent,
  ],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails {
  // Pure UI Mock Data - 100% مستقل عن الباك إند
  course = signal<ICourseDetails>(MOCK_COURSE);
  sections = signal<ISection[]>(MOCK_SECTIONS);
  lessons = signal<ILesson[]>(MOCK_LESSONS);
  reviews = signal<IReview[]>(MOCK_REVIEWS);
  relatedCourses = signal<IRelatedCourse[]>(MOCK_RELATED_COURSES);
  progressService = inject(CourseProgressService);
  private router = inject(Router);

  onEnroll(): void {
    if (!this.progressService.isEnrolled()) {
      this.progressService.enroll();
      alert('🎉 Payment verified! You are now enrolled in the course. Section 1, Lesson 1 is now unlocked.');
    } else {
      const el = document.querySelector('app-course-curriculum');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onAddToCart(): void {
    console.log('Add to cart clicked (UI Mode)');
  }
}