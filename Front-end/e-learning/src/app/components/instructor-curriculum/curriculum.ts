import Swal from 'sweetalert2';
import {
  Component,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  InstructorData,
  InstructorCourse,
  CurriculumSection,
  CurriculumLesson,
  CurriculumQuiz
} from '../../page/instructor-data';

import {
  InstructorSidebar
} from '../../page/instructor-sidebar/sidebar';


@Component({
  selector: 'app-instructor-curriculum',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    InstructorSidebar
  ],
  templateUrl: './curriculum.html',
  styleUrl: './curriculum.css'
})
export class InstructorCurriculum {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  protected readonly data =
    inject(InstructorData);

  // مش readonly عشان نقدر نحدّث status محلياً
  protected course: InstructorCourse;

  protected showDeleteModal = false;

  protected deleteType:
    'section' | 'lesson' | 'quiz' | '' = '';

  protected deleteSectionId = '';

  protected deleteLessonId = '';

  protected deleteQuizId = '';

  protected deleteTitle = '';

  protected collapsedSections:
    Record<string, boolean> = {};


  constructor() {

    const courseId =
      this.route.snapshot.queryParamMap.get(
        'courseId'
      );

    const courseTitle =
      this.route.snapshot.queryParamMap.get(
        'course'
      );

    const foundCourse =
      courseId
        ? this.data.getCourseById(courseId)
        : this.data.courses.find(
            item =>
              item.title === courseTitle
          );

    this.course =
      foundCourse ||
      this.data.courses[0];
  }


  // =========================================================
  // COURSE ACTIONS
  // =========================================================

  saveChanges(): void {

    const newStatus =
      this.course.status === 'Assigned'
        ? 'Draft'
        : this.course.status;

    this.data.updateCourse(
      this.course.id,
      {
        status: newStatus,
        updated: 'Just now'
      }
    );

    this.course.status = newStatus;
    this.course.updated = 'Just now';

    Swal.fire('Notice', 'Changes saved successfully.', 'info');
  }


  submitForReview(): void {

    if (this.course.status === 'Published') {
      Swal.fire('Notice', 'This course is already published.', 'info');
      return;
    }

    if (this.course.status === 'In Review') {
      Swal.fire('Notice', 'This course is already under review.', 'info');
      return;
    }

    if (
      this.course.status !== 'Draft' &&
      this.course.status !== 'Changes Required' &&
      this.course.status !== 'Assigned'
    ) {
      Swal.fire('Notice', 'This course cannot be submitted at the moment.', 'info');
      return;
    }

    if (this.data.sections.length === 0) {
      Swal.fire('Notice', 'Please add at least one section before submitting the course.', 'info');
      return;
    }

    for (const section of this.data.sections) {

      if (section.lessons.length === 0) {
        Swal.fire('Notice', `Section "${section.title}" must contain at least one lesson.`
        , 'info');
        return;
      }

      for (const lesson of section.lessons) {
        const lessonQuiz =
          this.getLessonQuiz(section, lesson.id);

        if (!lessonQuiz) {
          Swal.fire('Notice', `Lesson "${lesson.title}" must have a quiz before submitting the course.`
          , 'info');
          return;
        }
      }

      const finalQuiz =
        this.getSectionFinalQuiz(section);

      if (!finalQuiz) {
        Swal.fire('Notice', `Section "${section.title}" must have a final quiz before submitting the course.`
        , 'info');
        return;
      }
    }

    const submitted =
      this.data.submitCourseForReview(
        this.course.id
      );

    if (!submitted) {

      this.data.updateCourse(this.course.id, {
        status: 'In Review',
        updated: 'Just now',
        reviewMessage: ''
      });

      const instructorName =
        this.course.instructorName ||
        `${this.data.instructor.firstName} ${this.data.instructor.lastName}`.trim() ||
        'Instructor';

      this.data.addAdminNotification({
        title: 'New course under review',
        message:
          `${instructorName} submitted "${this.course.title}" for review. Please review and approve it.`,
        type: 'Course',
        isRead: false
      });
    }

    this.course.status = 'In Review';
    this.course.reviewMessage = '';
    this.course.updated = 'Just now';

    Swal.fire('Notice', 'Course submitted for review successfully. Admin has been notified.'
    , 'info');
  }


  previewCourse(): void {

    this.router.navigate(
      ['/instructor-course-preview'],
      {
        queryParams: {
          course: this.course.title,
          courseId: this.course.id
        }
      }
    );
  }


  // =========================================================
  // SECTION ACTIONS
  // =========================================================

  addSection(): void {

    this.router.navigate(
      ['/instructor-section'],
      {
        queryParams: {
          course: this.course.title,
          courseId: this.course.id
        }
      }
    );
  }


  editSection(sectionId: string): void {

    this.router.navigate(
      ['/instructor-section'],
      {
        queryParams: {
          section: sectionId,
          course: this.course.title,
          courseId: this.course.id
        }
      }
    );
  }


  deleteSection(sectionId: string): void {

    const section =
      this.data.sections.find(
        item => item.id === sectionId
      );

    if (!section) {
      return;
    }

    this.openDeleteModal(
      'section',
      section.title,
      sectionId
    );
  }


  toggleSection(sectionId: string): void {
    this.collapsedSections[sectionId] =
      !this.collapsedSections[sectionId];
  }


  // =========================================================
  // LESSON ACTIONS
  // =========================================================

  addLesson(sectionId: string): void {

    this.router.navigate(
      ['/instructor-lesson'],
      {
        queryParams: {
          section: sectionId,
          course: this.course.title,
          courseId: this.course.id
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
          course: this.course.title,
          courseId: this.course.id
        }
      }
    );
  }


  openLessonQuiz(
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

    if (!lesson) {
      return;
    }

    const existingQuiz =
      this.getLessonQuiz(section!, lessonId);

    this.router.navigate(
      ['/instructor-quiz'],
      {
        queryParams: {
          section: sectionId,
          lesson: lessonId,
          quiz: existingQuiz?.id || '',
          type: 'Lesson',
          course: this.course.title,
          courseId: this.course.id
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

    if (!lesson) {
      return;
    }

    this.openDeleteModal(
      'lesson',
      lesson.title,
      sectionId,
      lessonId
    );
  }


  // =========================================================
  // QUIZ ACTIONS
  // =========================================================

  openFinalQuiz(sectionId: string): void {

    const section =
      this.data.sections.find(
        item => item.id === sectionId
      );

    if (!section) {
      return;
    }

    const finalQuiz =
      this.getSectionFinalQuiz(section);

    this.router.navigate(
      ['/instructor-quiz'],
      {
        queryParams: {
          section: sectionId,
          quiz: finalQuiz?.id || '',
          type: 'Section',
          course: this.course.title,
          courseId: this.course.id
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

    if (!quiz) {
      return;
    }

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
    this.deleteSectionId = sectionId;
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

    if (this.deleteType === 'section') {
      this.data.removeSection(this.deleteSectionId);
    }

    if (this.deleteType === 'lesson') {
      this.data.removeLesson(
        this.deleteSectionId,
        this.deleteLessonId
      );
    }

    if (this.deleteType === 'quiz') {
      this.data.removeQuiz(
        this.deleteSectionId,
        this.deleteQuizId
      );
    }

    this.closeDeleteModal();
  }


  // =========================================================
  // QUIZ HELPERS
  // =========================================================

  getLessonQuiz(
    section: CurriculumSection,
    lessonId: string
  ): CurriculumQuiz | undefined {

    return section.quizzes.find(
      quiz =>
        quiz.type === 'Lesson' &&
        quiz.lessonId === lessonId
    );
  }


  getSectionFinalQuiz(
    section: CurriculumSection
  ): CurriculumQuiz | undefined {

    return section.quizzes.find(
      quiz => quiz.type === 'Section'
    );
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

  sectionMeta(section: CurriculumSection): string {

    const total =
      section.lessons.length +
      section.quizzes.length;

    return `${total} ${
      total === 1 ? 'item' : 'items'
    }`;
  }


  lessonMeta(lesson: CurriculumLesson): string {

    return `${lesson.type} · ${lesson.duration}${
      lesson.preview ? ' · Preview' : ''
    }`;
  }


  quizMeta(quiz: CurriculumQuiz): string {

    const type =
      quiz.type === 'Lesson'
        ? 'Lesson Quiz'
        : 'Section Final Quiz';

    return `${type} · ${quiz.questions.length} questions · ${quiz.passingScore}% passing · ${quiz.duration}`;
  }

}