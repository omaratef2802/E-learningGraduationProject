import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LearningPlayerService,
  PlayerCertificate,
  PlayerSection,
  QuizContent,
  QuizResult,
} from '../../services/learning-player.service';

@Component({
  selector: 'app-course-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course-quiz.html',
  styleUrl: './course-quiz.css',
})
export class CourseQuiz implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly learning = inject(LearningPlayerService);
  private readonly cdr = inject(ChangeDetectorRef);

  courseId = this.route.snapshot.paramMap.get('courseId') || '';
  quizId = this.route.snapshot.paramMap.get('quizId') || '';
  quiz: QuizContent | null = null;
  loading = true;
  errorMessage = '';
  answers: Record<number, string> = {};
  result: QuizResult['attempt'] | null = null;
  certificate: PlayerCertificate | null = null;
  submitting = false;

  ngOnInit(): void {
    if (!this.courseId || !this.quizId) {
      this.errorMessage = 'Quiz link is incomplete.';
      this.loading = false;
      return;
    }
    // Never trust a quiz ID from the URL: verify that it belongs to this course.
    this.learning.getCourseState(this.courseId).subscribe({
      next: (state) => {
        const belongs = state.sections.some(
          (section: PlayerSection) =>
            section.finalQuiz?.id === this.quizId ||
            section.lessons.some((lesson) => lesson.quizId === this.quizId),
        );
        if (!belongs) {
          this.errorMessage = 'This quiz does not belong to this course.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        this.loadQuiz();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'You must be enrolled to take this quiz.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadQuiz(): void {
    this.loading = true;
    this.learning.getQuiz(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'This quiz is not available yet.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  get totalPoints(): number {
    return this.quiz?.questions.reduce((sum, question) => sum + question.points, 0) ?? 0;
  }

  get answeredCount(): number {
    return Object.keys(this.answers).length;
  }

  selectAnswer(index: number, option: string): void {
    this.answers = { ...this.answers, [index]: option };
  }

  submit(): void {
    if (!this.quiz || this.submitting || this.result) return;
    if (this.answeredCount !== this.quiz.questions.length) {
      this.errorMessage = 'Please answer every question before submitting.';
      return;
    }
    this.errorMessage = '';
    this.submitting = true;
    const studentAnswers = this.quiz.questions.map((_, questionIndex) => ({
      questionIndex,
      selectedAnswer: this.answers[questionIndex],
    }));
    this.learning.submitQuiz(this.quizId, studentAnswers).subscribe({
      next: (response) => {
        this.result = response.attempt;
        this.certificate = response.certificate;
        this.submitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Could not submit your quiz. Please try again.';
        this.submitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  retry(): void {
    this.answers = {};
    this.result = null;
    this.errorMessage = '';
  }
}
