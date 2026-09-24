import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IQuiz } from '../../models';
import { ALL_QUIZZES, SECTION_1_QUIZ } from '../../quiz-data';
import { CourseProgressService } from '../../../course/course-progress';

@Component({
  selector: 'app-quiz-player',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quiz-player.html',
  styleUrl: './quiz-player.css',
})
export class QuizPlayer implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private progressService = inject(CourseProgressService);

  // Reactive state management using Angular Signals
  quiz = signal<IQuiz>(SECTION_1_QUIZ);
  currentQuestionIndex = signal<number>(0);
  selectedAnswers = signal<Record<number, number>>({});
  isSubmitted = signal<boolean>(false);
  calculatedScore = signal<number>(0);
  isPassed = signal<boolean>(false);

  currentQuestion = computed(() => this.quiz().questions[this.currentQuestionIndex()]);
  totalQuestions = computed(() => this.quiz().questions.length);
  isLastQuestion = computed(() => this.currentQuestionIndex() === this.totalQuestions() - 1);
  isFirstQuestion = computed(() => this.currentQuestionIndex() === 0);
  progressPercentage = computed(() => ((this.currentQuestionIndex() + 1) / this.totalQuestions()) * 100);

  // Directly link from last lesson quiz of a section to the Section Comprehensive Exam!
  nextSectionExamId = computed(() => {
    const qId = this.quiz().id;
    if (qId === 'quiz_l3') return 's1'; // Section 1 Comprehensive Exam
    if (qId === 'quiz_l6') return 's2'; // Section 2 Comprehensive Exam
    if (qId === 'quiz_l8') return 's3'; // Section 3 Final Capstone Exam
    return null;
  });

  nextSectionExamTitle = computed(() => {
    const nextExam = this.nextSectionExamId();
    if (nextExam === 's1') return 'Take Section 1 Comprehensive Exam (10 Questions) ↗';
    if (nextExam === 's2') return 'Take Section 2 Comprehensive Exam (10 Questions) ↗';
    if (nextExam === 's3') return 'Start Capstone Final Exam & Certification (10 Questions) 🎓';
    return null;
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const qId = params.get('sectionId') || 's1';
      if (ALL_QUIZZES[qId]) {
        this.quiz.set(ALL_QUIZZES[qId]);
        this.restartQuiz();
      }
    });
  }

  selectOption(optionIndex: number): void {
    const qId = this.currentQuestion().id;
    this.selectedAnswers.update((prev) => ({
      ...prev,
      [qId]: optionIndex,
    }));
  }

  isOptionSelected(optionIndex: number): boolean {
    const qId = this.currentQuestion().id;
    return this.selectedAnswers()[qId] === optionIndex;
  }

  hasAnsweredCurrentQuestion(): boolean {
    const qId = this.currentQuestion().id;
    return this.selectedAnswers()[qId] !== undefined;
  }

  nextQuestion(): void {
    if (!this.hasAnsweredCurrentQuestion()) return;
    if (!this.isLastQuestion()) {
      this.currentQuestionIndex.update((i) => i + 1);
    }
  }

  previousQuestion(): void {
    if (!this.isFirstQuestion()) {
      this.currentQuestionIndex.update((i) => i - 1);
    }
  }

  finishQuiz(): void {
    if (!this.hasAnsweredCurrentQuestion()) return;

    // Calculate total score percentage
    const answers = this.selectedAnswers();
    let correctCount = 0;

    this.quiz().questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / this.totalQuestions()) * 100);
    this.calculatedScore.set(score);
    const passed = score >= this.quiz().passingScore; // >= 60%
    this.isPassed.set(passed);
    this.isSubmitted.set(true);

    if (passed) {
      // ONLY pass the quiz itself by its specific unique ID!
      this.progressService.passQuiz(this.quiz().id);

      // If this is the Final Capstone Quiz (Section 3 Exam), transition directly to Certificate page!
      if (this.quiz().isFinalCapstone) {
        this.router.navigate(['/certificate'], {
          queryParams: {
            score: score,
            passed: true,
            section: this.quiz().sectionId,
          },
        });
      }
    }
  }

  goToNextExam(): void {
    const nextExam = this.nextSectionExamId();
    if (nextExam && ALL_QUIZZES[nextExam]) {
      this.quiz.set(ALL_QUIZZES[nextExam]);
      this.restartQuiz();
      this.router.navigate(['/quiz', nextExam]);
    }
  }

  // Quick dev / demo helpers requested in mockup
  autoFillHigh(): void {
    const allCorrect: Record<number, number> = {};
    this.quiz().questions.forEach((q) => {
      allCorrect[q.id] = q.correctAnswer;
    });
    this.selectedAnswers.set(allCorrect);
    this.currentQuestionIndex.set(this.totalQuestions() - 1);
  }

  autoFillLow(): void {
    const mostlyWrong: Record<number, number> = {};
    const total = this.totalQuestions();
    this.quiz().questions.forEach((q, idx) => {
      const shouldBeCorrect = total <= 3 ? idx === 0 : idx < Math.floor(total * 0.4);
      mostlyWrong[q.id] = shouldBeCorrect ? q.correctAnswer : (q.correctAnswer + 1) % q.options.length;
    });
    this.selectedAnswers.set(mostlyWrong);
    this.currentQuestionIndex.set(this.totalQuestions() - 1);
  }

  restartQuiz(): void {
    this.selectedAnswers.set({});
    this.currentQuestionIndex.set(0);
    this.isSubmitted.set(false);
  }

  goBack(): void {
    this.router.navigate(['/courses/6aadbda18bcef3360dc2dd']);
  }
}
