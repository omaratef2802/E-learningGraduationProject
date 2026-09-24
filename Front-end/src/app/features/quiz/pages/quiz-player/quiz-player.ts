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

  ngOnInit(): void {
    const sectionId = this.route.snapshot.paramMap.get('sectionId') || 's1';
    if (ALL_QUIZZES[sectionId]) {
      this.quiz.set(ALL_QUIZZES[sectionId]);
    }
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
    if (!this.hasAnsweredCurrentQuestion()) {
      return; // Must answer current question first
    }
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
    if (!this.hasAnsweredCurrentQuestion()) {
      return; // Must answer last question before finishing
    }

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

    const nextSectionMap: Record<string, string> = {
      s1: 's2',
      s2: 's3',
    };
    const nextSec = nextSectionMap[this.quiz().sectionId];

    // If passed >= 60%, unlock the next section!
    if (passed) {
      this.progressService.passSection(this.quiz().sectionId, nextSec);

      // If this is the Final Capstone Quiz (Section 3), transition to the Certificate page!
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

  // Quick dev / demo helpers requested in mockup
  autoFillHigh(): void {
    const allCorrect: Record<number, number> = {};
    this.quiz().questions.forEach((q) => {
      allCorrect[q.id] = q.correctAnswer;
    });
    this.selectedAnswers.set(allCorrect);
    // jump to last question to test Finish
    this.currentQuestionIndex.set(this.totalQuestions() - 1);
  }

  autoFillLow(): void {
    const mostlyWrong: Record<number, number> = {};
    this.quiz().questions.forEach((q, idx) => {
      // Pick correct for 4 questions (40%), wrong for rest to test < 60% failure
      mostlyWrong[q.id] = idx < 4 ? q.correctAnswer : (q.correctAnswer + 1) % 4;
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
