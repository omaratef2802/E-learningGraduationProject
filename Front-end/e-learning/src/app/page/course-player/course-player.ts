import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { InstructorService } from '../../services/instructor.service';
import {
  LearningPlayerService,
  LessonContent,
  PlayerCertificate,
  PlayerLesson,
  PlayerQuiz,
  PlayerSection,
  PlayerState,
  QuizContent,
  QuizResult,
} from '../../services/learning-player.service';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './course-player.html',
  styleUrl: './course-player.css',
})
export class CoursePlayer implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly learning = inject(LearningPlayerService);
  private readonly instructorService = inject(InstructorService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  courseId = '';
  courseTitle = '';
  loading = true;
  errorMessage = '';
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer?: ReturnType<typeof setTimeout>;

  state: PlayerState | null = null;

  // Content pane
  view: 'lesson' | 'quiz' | 'overview' = 'overview';
  contentLoading = false;
  activeLesson: LessonContent | null = null;
  activeLessonId = '';
  activeQuiz: QuizContent | null = null;
  activeQuizId = '';

  // Quiz answering
  answers: Record<number, string> = {};
  submitting = false;
  quizResult: { percentage: number; passed: boolean; score: number; totalScore: number } | null =
    null;

  // Auto-generated certificate, revealed once the last section's final quiz is passed.
  certificate: PlayerCertificate | null = null;

  completeBusy = false;

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('courseId') ?? '';
    if (!this.courseId) {
      this.loading = false;
      this.errorMessage = 'Course id is missing.';
      return;
    }
    this.instructorService.getCourse(this.courseId).subscribe({
      next: (course: any) => {
        this.courseTitle = course?.title || 'Course';
        if (this.courseCompleted) this.loadExistingCertificate();
        this.changeDetector.detectChanges();
      },
      error: () => {},
    });
    this.loadState();
  }

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  loadState(openFirst = false): void {
    this.loading = true;
    this.learning.getCourseState(this.courseId).subscribe({
      next: (state: PlayerState) => {
        this.state = state;
        this.loading = false;
        if (openFirst) this.openNextLesson();
        // A student who already finished the course should still see the
        // certificate they earned, even before passing a quiz again.
        if (this.courseCompleted) this.loadExistingCertificate();
        this.changeDetector.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message ||
          'We could not load your course progress. Please make sure you are enrolled.';
        this.changeDetector.detectChanges();
      },
    });
  }

  private loadExistingCertificate(): void {
    if (this.certificate) return;
    this.learning.getMyCertificates().subscribe({
      next: (certificates) => {
        const match = certificates.find((item) => item.course === this.courseId);
        if (match) this.certificate = match;
        this.changeDetector.detectChanges();
      },
      error: () => {},
    });
  }

  /** Opens the first unlocked-but-not-completed lesson, or the first lesson. */
  private openNextLesson(): void {
    const sections = this.state?.sections ?? [];
    for (const section of sections) {
      if (!section.unlocked) continue;
      const next = section.lessons.find((lesson) => lesson.unlocked && !lesson.completed);
      if (next) {
        this.openLesson(next.id);
        return;
      }
    }
    const first = sections.find((section) => section.unlocked)?.lessons[0];
    if (first) this.openLesson(first.id);
  }

  openLesson(lessonId: string): void {
    if (this.contentLoading && lessonId === this.activeLessonId) return;
    const lesson = this.findLesson(lessonId);
    if (lesson && !lesson.unlocked) {
      this.showToast(
        'This lesson is locked. Finish the previous lesson and its quiz first.',
        'error',
      );
      return;
    }
    this.contentLoading = true;
    this.activeLessonId = lessonId;
    this.activeQuiz = null;
    this.activeQuizId = '';
    this.quizResult = null;
    this.view = 'lesson';
    this.learning.getLesson(this.courseId, lessonId).subscribe({
      next: (content: LessonContent) => {
        this.activeLesson = content;
        this.contentLoading = false;
        this.changeDetector.detectChanges();
      },
      error: (err: any) => {
        this.contentLoading = false;
        this.view = 'overview';
        this.showToast(err.error?.message || 'This lesson is not available yet.', 'error');
        this.changeDetector.detectChanges();
      },
    });
  }

  openQuiz(quizId: string): void {
    const quiz = this.findQuiz(quizId);
    if (quiz && !quiz.unlocked) {
      this.showToast('Finish all lessons in this section before taking the final quiz.', 'error');
      return;
    }
    this.router.navigate(['/learn', this.courseId, 'quiz', quizId]);
  }

  markLessonComplete(): void {
    if (this.completeBusy || !this.activeLessonId) return;
    this.completeBusy = true;
    this.learning.completeLesson(this.courseId, this.activeLessonId).subscribe({
      next: (state: PlayerState) => {
        this.state = state;
        this.completeBusy = false;
        this.showToast('Lesson completed. Keep going!');
        this.changeDetector.detectChanges();
      },
      error: (err: any) => {
        this.completeBusy = false;
        this.showToast(err.error?.message || 'Could not mark the lesson complete.', 'error');
        this.changeDetector.detectChanges();
      },
    });
  }

  selectAnswer(questionIndex: number, option: string): void {
    this.answers = { ...this.answers, [questionIndex]: option };
  }

  submitQuiz(): void {
    if (!this.activeQuiz || this.submitting) return;
    const total = this.activeQuiz.questions.length;
    const answered = Object.keys(this.answers).length;
    if (answered < total) {
      this.showToast(`Answer all questions first (${answered}/${total}).`, 'error');
      return;
    }
    const studentAnswers = this.activeQuiz.questions.map((_, index) => ({
      questionIndex: index,
      selectedAnswer: this.answers[index],
    }));
    this.submitting = true;
    this.learning
      .submitQuiz(this.activeQuizId, studentAnswers, this.activeLessonId || undefined)
      .subscribe({
        next: (result: QuizResult) => {
          this.submitting = false;
          this.quizResult = result.attempt;
          if (result.certificate) this.certificate = result.certificate;
          this.state = {
            ...(this.state as PlayerState),
            sections: result.sections,
            enrollment: result.enrollment,
          };
          this.showToast(
            result.attempt.passed
              ? `Passed with ${result.attempt.percentage}%`
              : `Scored ${result.attempt.percentage}%. Try again to pass.`,
            result.attempt.passed ? 'success' : 'error',
          );
          this.changeDetector.detectChanges();
        },
        error: (err: any) => {
          this.submitting = false;
          this.showToast(err.error?.message || 'Could not submit your quiz.', 'error');
          this.changeDetector.detectChanges();
        },
      });
  }

  retakeQuiz(): void {
    if (!this.activeQuizId) return;
    this.quizResult = null;
    this.answers = {};
    this.openQuiz(this.activeQuizId);
  }

  isAnswered(questionIndex: number, option: string): boolean {
    return this.answers[questionIndex] === option;
  }

  /** Sum of every question's point value, shown in the quiz header. */
  get activeQuizTotalPoints(): number {
    return (this.activeQuiz?.questions ?? []).reduce(
      (total, question) => total + (question.points || 1),
      0,
    );
  }

  findLesson(lessonId: string): PlayerLesson | null {
    const sections: PlayerSection[] = this.state?.sections ?? [];
    for (const section of sections) {
      const lesson = section.lessons.find((item) => item.id === lessonId);
      if (lesson) return lesson;
    }
    return null;
  }

  findQuiz(quizId: string): PlayerQuiz | null {
    const sections: PlayerSection[] = this.state?.sections ?? [];
    for (const section of sections) {
      if (section.finalQuiz?.id === quizId) return section.finalQuiz;
      const lesson = section.lessons.find((item) => item.quizId === quizId);
      if (lesson) {
        return {
          id: quizId,
          title: 'Lesson quiz',
          unlocked: lesson.unlocked,
          passed: lesson.quizPassed,
          score: lesson.score,
        };
      }
    }
    return null;
  }

  sectionProgress(section: PlayerSection): number {
    const lessons: PlayerLesson[] = section.lessons;
    const total = lessons.length + (section.finalQuiz ? 1 : 0);
    if (total === 0) return 0;
    const completedLessons = lessons.filter((lesson) => lesson.completed).length;
    const quizDone = section.finalQuiz?.passed ? 1 : 0;
    return Math.round(((completedLessons + quizDone) / total) * 100);
  }

  get overallProgress(): number {
    return this.state?.enrollment?.progress ?? 0;
  }

  /** True once every section is fully completed (last lesson + final quiz). */
  get courseCompleted(): boolean {
    const sections = this.state?.sections ?? [];
    return sections.length > 0 && sections.every((section) => section.completed);
  }

  verificationLink(certificate: PlayerCertificate): string {
    return `http://localhost:3000/E-learning/certificate/verify/${encodeURIComponent(certificate.certificateId)}`;
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage = message;
    this.toastType = type;
    this.changeDetector.detectChanges();
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.changeDetector.detectChanges();
    }, 3200);
  }
}
