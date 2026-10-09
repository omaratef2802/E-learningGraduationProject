import Swal from 'sweetalert2';
import {
  Component,
  ChangeDetectorRef,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';


import { InstructorSidebar } from '../../page/instructor-sidebar/sidebar';

import { InstructorDataService } from '../../services/instructor-data.service';
import {
  CurriculumLesson,
  CurriculumQuiz,
  CurriculumSection,
  InstructorCourse,
  InstructorProfile,
} from '../../mock-types';

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
export class InstructorCurriculum implements OnInit {
  protected readonly fallbackCourseImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly dataService =
    inject(InstructorDataService);

  private readonly changeDetector = inject(ChangeDetectorRef);

  private readonly courseIdParam =
    this.route.snapshot.queryParamMap.get('courseId') || '';

  private readonly courseTitleParam =
    this.route.snapshot.queryParamMap.get('course') || '';

  /** The instructor record, used to attribute a submitted course. */
  protected instructor: InstructorProfile | null = null;

  /** Sections with nested lessons and quizzes, loaded from the database. */
  protected sections: CurriculumSection[] = [];

  /** The instructor's own courses, loaded from the database. */
  protected courses: InstructorCourse[] = [];

  protected course: InstructorCourse | null = null;
  protected loadError = '';

  protected showDeleteModal = false;

  protected deleteType:
    'section' | 'lesson' | 'quiz' | '' = '';

  protected deleteSectionId = '';

  protected deleteLessonId = '';

  protected deleteQuizId = '';

  protected deleteTitle = '';

  protected collapsedSections:
    Record<string, boolean> = {};


  ngOnInit(): void {

    // The instructor's own courses (GET /course is instructor-aware).
    this.dataService.getMyCourses().subscribe({
      next: (courses) => {
        this.courses = courses as InstructorCourse[];
        this.resolveCourse();
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching courses:', err);
        this.loadError = err?.error?.message || 'Could not load your course. Check your instructor session and try again.';
        this.changeDetector.detectChanges();
      },
    });

    // The signed-in instructor, for the review notification text.
    this.dataService.getProfile().subscribe({
      next: (profile) => {
        this.instructor = profile;
        this.changeDetector.detectChanges();
      },
      error: () => {},
    });

    if (this.courseIdParam) {
      this.dataService.getCurriculum(this.courseIdParam).subscribe({
        next: (sections) => {
          this.sections = sections;
          this.loadError = '';
          this.changeDetector.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching curriculum:', err);
          this.loadError = err?.error?.message || 'Could not load the course curriculum.';
          this.changeDetector.detectChanges();
        },
      });
    }
  }


  private resolveCourse(): void {

    this.course =
      this.courses.find(
        (course) => course._id === this.courseIdParam
      ) ||
      this.courses.find(
        (course) => course.title === this.courseTitleParam
      ) ||
      this.courses[0] ||
      null;

    // When the URL carried no courseId, load the resolved course's curriculum.
    if (!this.courseIdParam && this.course) {
      this.dataService.getCurriculum(this.courseId).subscribe({
        next: (sections) => {
          this.sections = sections;
          this.loadError = '';
          this.changeDetector.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching curriculum:', err);
          this.loadError = err?.error?.message || 'Could not load the course curriculum.';
          this.changeDetector.detectChanges();
        },
      });
    }
  }


  /** The category is stored as an id unless the backend populated it. */
  protected get categoryName(): string {
    const category = this.course?.category;
    return category && typeof category === 'object' ? category.name : '';
  }


  /**
   * Navigation helpers below read the course title frequently; this keeps the
   * null check in one place while the course is still loading.
   */
  protected get courseTitle(): string {
    return this.course?.title ?? '';
  }

  useFallbackCourseImage(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (image.getAttribute('src') === this.fallbackCourseImage) {
      image.style.display = 'none';
      return;
    }
    image.src = this.fallbackCourseImage;
  }


  /** Empty while the course is still loading, which router params accept. */
  protected get courseId(): string {
    return this.course?._id ?? '';
  }


  /**
 * The templates still use the old capitalised status labels and the mock
 * store's `data.*` shape. These helpers map the database values onto both.
 */
  protected get statusLabel(): string {
    const status = this.course?.status;
    switch (status) {
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


  protected get isDraft(): boolean {
    return this.course?.status === 'draft';
  }


  protected get isInReview(): boolean {
    return this.course?.status === 'in_review';
  }


  protected get isChangesRequired(): boolean {
    return this.course?.status === 'changes_required';
  }


  protected get isPublished(): boolean {
    return this.course?.status === 'published';
  }


  /** True while the course is still editable by the instructor. */
  protected get canEdit(): boolean {
    return this.isDraft || this.isChangesRequired;
  }


  /** True when the course can be sent to the admin for review. */
  protected get canSubmit(): boolean {
    return this.canEdit;
  }


  /** The admin's feedback when the course was sent back. */
  protected get reviewMessage(): string {
    return this.course?.reviewMessage ?? '';
  }


  /** Backwards-compatible view used by the template (`data.sections`). */
  protected get data(): { sections: CurriculumSection[] } {
    return { sections: this.sections };
  }


  // =========================================================
  // COURSE ACTIONS
  // =========================================================

  saveChanges(): void {

    const course = this.course;

    if (!course) return;

    // The backend exposes course state through PATCH /course/status/:id with
    // draft | published | archived. Draft is the only state an instructor can
    // move back to from here.
    if (course.status !== 'draft') {
      Swal.fire(
        'Notice',
        'Only draft courses can be edited. Use the status controls to change it.',
        'info'
      );
      return;
    }

    Swal.fire('Notice', 'Changes saved successfully.', 'info');
  }


  submitForReview(): void {

    const course = this.course;

    if (!course) return;

    if (course.status === 'published') {
      Swal.fire('Notice', 'This course is already published.', 'info');
      return;
    }

    if (course.status === 'archived') {
      Swal.fire('Notice', 'An archived course cannot be submitted.', 'info');
      return;
    }

    if (!this.canSubmit) {
      Swal.fire('Notice', 'This course is already under review.', 'info');
      return;
    }

    if (this.sections.length === 0) {
      Swal.fire('Notice', 'Please add at least one section before submitting the course.', 'info');
      return;
    }

    // The backend refuses to send a course to review without sections and
    // lessons (see updateCourseStatus), so the client check mirrors that rule.
    for (const section of this.sections) {

      if (section.lessons.length === 0) {
        Swal.fire('Notice', `Section "${section.title}" must contain at least one lesson.`
        , 'info');
        return;
      }
    }

    // PATCH /course/status/:id moves the course into the admin review queue;
    // the admin then approves it through PATCH /course/review/:id.
    this.dataService.updateCourseStatus(course._id, 'in_review').subscribe({
      next: () => {
        course.status = 'in_review';
        course.reviewMessage = undefined;

        Swal.fire('Notice', 'Course submitted for review successfully.'
        , 'info');
      },
      error: (err) => {
        console.error('Failed to submit course:', err);
        Swal.fire(
          'Error',
          err?.error?.message || 'Failed to submit this course.',
          'error'
        );
      },
    });
  }


  /**
   * Pulls a course back out of the review queue. The backend only allows this
   * from in_review back to draft.
   */
  withdrawFromReview(): void {

    const course = this.course;

    if (!course || !this.isInReview) return;

    this.dataService.updateCourseStatus(course._id, 'draft').subscribe({
      next: () => {
        course.status = 'draft';
        Swal.fire('Notice', 'Course withdrawn from review.', 'info');
      },
      error: (err) => {
        console.error('Failed to withdraw course:', err);
        Swal.fire(
          'Error',
          err?.error?.message || 'Failed to withdraw this course.',
          'error'
        );
      },
    });
  }


  previewCourse(): void {

    this.router.navigate(
      ['/instructor-course-preview'],
      {
        queryParams: {
          course: this.courseTitle,
          courseId: this.courseId
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
          course: this.courseTitle,
          courseId: this.courseId
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
          course: this.courseTitle,
          courseId: this.courseId
        }
      }
    );
  }


  deleteSection(sectionId: string): void {

    const section =
      this.sections.find(
        (item: any) => item.id === sectionId
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
          course: this.courseTitle,
          courseId: this.courseId
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
          course: this.courseTitle,
          courseId: this.courseId
        }
      }
    );
  }


  openLessonQuiz(
    sectionId: string,
    lessonId: string
  ): void {

    const section =
      this.sections.find(
        (item: any) => item.id === sectionId
      );

    const lesson =
      section?.lessons.find(
        (item: any) => item.id === lessonId
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
          course: this.courseTitle,
          courseId: this.courseId
        }
      }
    );
  }


  deleteLesson(
    sectionId: string,
    lessonId: string
  ): void {

    const section =
      this.sections.find(
        (item: any) => item.id === sectionId
      );

    const lesson =
      section?.lessons.find(
        (item: any) => item.id === lessonId
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
      this.sections.find(
        (item: any) => item.id === sectionId
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
          course: this.courseTitle,
          courseId: this.courseId
        }
      }
    );
  }


  deleteQuiz(
    sectionId: string,
    quizId: string
  ): void {

    const section =
      this.sections.find(
        (item: any) => item.id === sectionId
      );

    const quiz =
      section?.quizzes.find(
        (item: any) => item.id === quizId
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

    if (!this.course) return;

    const reload = () => {
      this.dataService.getCurriculum(this.course!._id).subscribe({
        next: (sections) => {
          this.sections = sections;
          this.changeDetector.detectChanges();
        },
      });
    };

    if (this.deleteType === 'section') {
      // DELETE /section/:id
      this.dataService.deleteSection(this.deleteSectionId).subscribe({
        next: () => {
          reload();
          this.closeDeleteModal();
        },
        error: (err) => this.reportDeleteError(err),
      });
    }

    if (this.deleteType === 'lesson') {
      // DELETE /lesson/:id
      this.dataService.deleteLesson(this.deleteLessonId).subscribe({
        next: () => {
          reload();
          this.closeDeleteModal();
        },
        error: (err) => this.reportDeleteError(err),
      });
    }

    if (this.deleteType === 'quiz') {
      // DELETE /Quiz/deleteQuiz/:id
      this.dataService.deleteQuiz(this.deleteQuizId).subscribe({
        next: () => {
          reload();
          this.closeDeleteModal();
        },
        error: (err) => this.reportDeleteError(err),
      });
    }
  }


  private reportDeleteError(err: any): void {

    console.error('Delete failed:', err);

    Swal.fire(
      'Error',
      err?.error?.message || 'Failed to delete this item.',
      'error'
    );
  }


  // =========================================================
  // QUIZ HELPERS
  // =========================================================

  getLessonQuiz(
    section: CurriculumSection,
    lessonId: string
  ): CurriculumQuiz | undefined {

    return section.quizzes.find(
      (quiz) =>
        quiz.type === 'Lesson' &&
        quiz.lessonId === lessonId
    );
  }


  getSectionFinalQuiz(
    section: CurriculumSection
  ): CurriculumQuiz | undefined {

    return section.quizzes.find(
      (quiz) => quiz.type === 'Section'
    );
  }


  // =========================================================
  // STATISTICS
  // =========================================================

  get totalLessons(): number {
    return this.sections.reduce(
      (total, section) =>
        total + section.lessons.length,
      0
    );
  }


  get totalQuizzes(): number {
    return this.sections.reduce(
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

    return `${lesson.type} - ${lesson.duration} min${
      lesson.isPreview ? ' - Preview' : ''
    }`;
  }


  quizMeta(quiz: CurriculumQuiz): string {

    const type =
      quiz.type === 'Lesson'
        ? 'Lesson Quiz'
        : 'Section Final Quiz';

    return `${type} - ${quiz.questions.length} questions - ${quiz.passingScore}% passing`;
  }

}



