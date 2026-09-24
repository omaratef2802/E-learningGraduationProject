import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  InstructorData,
  InstructorCourse
} from '../../page/instructor-data';

import { InstructorSidebar } from '../../page/instructor-sidebar/sidebar';

@Component({
  selector: 'app-instructor-curriculum',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    InstructorSidebar
  ],
  templateUrl: './curriculum.html',
  styleUrl: './curriculum.css',
})
export class InstructorCurriculum {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly data = inject(InstructorData);

  protected readonly course: InstructorCourse;

  // =========================================================
  // DELETE MODAL
  // =========================================================

  protected showDeleteModal = false;

  protected deleteType:
    'section' | 'lesson' | 'quiz' | '' = '';

  protected deleteSectionId = '';
  protected deleteLessonId = '';
  protected deleteQuizId = '';

  protected deleteTitle = '';

  // =========================================================
  // SECTION COLLAPSE
  // =========================================================

  protected collapsedSections: Record<string, boolean> = {};

  constructor() {

    const title =
      this.route.snapshot.queryParamMap.get('course');

    const foundCourse =
      this.data.courses.find(
        item => item.title === title
      );

    this.course =
      foundCourse || this.data.courses[0];
  }


  // =========================================================
  // COURSE ACTIONS
  // =========================================================

  saveChanges(): void {

    /*
     * كل بيانات الـ sections / lessons / quizzes
     * محفوظة بالفعل عن طريق InstructorData.
     *
     * هنا بنضمن إن بيانات الكورس نفسها تتعمل لها
     * persist مرة أخرى.
     */

    this.data.updateCourse(
      this.course.title,
      {
        updated: 'Just now'
      }
    );

    alert('Changes saved successfully.');
  }


  submitForReview(): void {

    /*
     * Submit for Review:
     *
     * Draft
     *   ↓
     * Pending Review
     */

    if (
      this.course.status !== 'Draft'
    ) {
      alert(
        'Only draft courses can be submitted for review.'
      );

      return;
    }

    this.data.updateCourse(
      this.course.title,
      {
        status: 'Pending Review',
        updated: 'Just now'
      }
    );

    alert(
      'Course submitted for review successfully.'
    );
  }


  // =========================================================
  // PREVIEW
  // =========================================================

  previewCourse(): void {

    this.router.navigate(
      ['/instructor-course-preview'],
      {
        queryParams: {
          course: this.course.title
        }
      }
    );
  }


  // =========================================================
  // SECTIONS
  // =========================================================

  addSection(): void {

    this.router.navigate(
      ['/instructor-section'],
      {
        queryParams: {
          course: this.course.title
        }
      }
    );
  }


  editSection(
    sectionId: string
  ): void {

    this.router.navigate(
      ['/instructor-section'],
      {
        queryParams: {
          section: sectionId,
          course: this.course.title
        }
      }
    );
  }


  deleteSection(
    sectionId: string
  ): void {

    const section =
      this.data.sections.find(
        item => item.id === sectionId
      );

    if (!section) return;

    this.openDeleteModal(
      'section',
      section.title,
      sectionId
    );
  }


  // =========================================================
  // LESSONS
  // =========================================================

  addLesson(
    sectionId: string
  ): void {

    this.router.navigate(
      ['/instructor-lesson'],
      {
        queryParams: {
          section: sectionId,
          course: this.course.title
        }
      }
    );
  }


  editLesson(
    sectionId: string,
    lessonId: string
  ): void {

    this.router.navigate(
      ['/instructor-lesson'],
      {
        queryParams: {
          section: sectionId,
          lesson: lessonId,
          course: this.course.title
        }
      }
    );
  }


  deleteLesson(
    sectionId: string,
    lessonId: string
  ): void {

    const section =
      this.data.sections.find(
        item => item.id === sectionId
      );

    const lesson =
      section?.lessons.find(
        item => item.id === lessonId
      );

    if (!lesson) return;

    this.openDeleteModal(
      'lesson',
      lesson.title,
      sectionId,
      lessonId
    );
  }


  // =========================================================
  // QUIZZES
  // =========================================================

  addQuiz(
    sectionId: string
  ): void {

    this.router.navigate(
      ['/instructor-quiz'],
      {
        queryParams: {
          section: sectionId,
          course: this.course.title
        }
      }
    );
  }


  editQuiz(
    sectionId: string,
    quizId: string
  ): void {

    this.router.navigate(
      ['/instructor-quiz'],
      {
        queryParams: {
          section: sectionId,
          quiz: quizId,
          course: this.course.title
        }
      }
    );
  }


  deleteQuiz(
    sectionId: string,
    quizId: string
  ): void {

    const section =
      this.data.sections.find(
        item => item.id === sectionId
      );

    const quiz =
      section?.quizzes.find(
        item => item.id === quizId
      );

    if (!quiz) return;

    this.openDeleteModal(
      'quiz',
      quiz.title,
      sectionId,
      quizId
    );
  }


  // =========================================================
  // DELETE MODAL
  // =========================================================

  openDeleteModal(
    type: 'section' | 'lesson' | 'quiz',
    title: string,
    sectionId: string,
    itemId = ''
  ): void {

    this.deleteType = type;

    this.deleteTitle = title;

    this.deleteSectionId =
      sectionId;

    this.deleteLessonId = '';
    this.deleteQuizId = '';

    if (type === 'lesson') {
      this.deleteLessonId = itemId;
    }

    if (type === 'quiz') {
      this.deleteQuizId = itemId;
    }

    this.showDeleteModal = true;
  }


  closeDeleteModal(): void {

    this.showDeleteModal = false;

    this.deleteType = '';

    this.deleteSectionId = '';
    this.deleteLessonId = '';
    this.deleteQuizId = '';
    this.deleteTitle = '';
  }


  confirmDelete(): void {

    if (
      this.deleteType === 'section'
    ) {

      this.data.removeSection(
        this.deleteSectionId
      );
    }


    if (
      this.deleteType === 'lesson'
    ) {

      this.data.removeLesson(
        this.deleteSectionId,
        this.deleteLessonId
      );
    }


    if (
      this.deleteType === 'quiz'
    ) {

      this.data.removeQuiz(
        this.deleteSectionId,
        this.deleteQuizId
      );
    }


    this.closeDeleteModal();
  }


  // =========================================================
  // COLLAPSE
  // =========================================================

  toggleSection(
    sectionId: string
  ): void {

    this.collapsedSections[sectionId] =
      !this.collapsedSections[sectionId];
  }


  // =========================================================
  // STATISTICS
  // =========================================================

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


  // =========================================================
  // DISPLAY HELPERS
  // =========================================================

  sectionMeta(
    section: {
      lessons: unknown[];
      quizzes: unknown[];
    }
  ): string {

    const total =
      section.lessons.length +
      section.quizzes.length;

    return `${total} ${
      total === 1 ? 'item' : 'items'
    }`;
  }


  lessonMeta(
    lesson: {
      type: string;
      duration: string;
      preview: boolean;
    }
  ): string {

    return `${lesson.type} · ${
      lesson.duration
    }${
      lesson.preview
        ? ' · Preview'
        : ''
    }`;
  }


  quizMeta(
    quiz: {
      questions: unknown[];
      passingScore: number;
      duration: string;
    }
  ): string {

    return `${
      quiz.questions.length
    } questions · ${
      quiz.passingScore
    }% passing · ${
      quiz.duration
    }`;
  }
}