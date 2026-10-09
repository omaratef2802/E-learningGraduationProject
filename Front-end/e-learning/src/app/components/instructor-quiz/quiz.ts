import Swal from 'sweetalert2';
import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';


import {
  InstructorSidebar
} from '../../page/instructor-sidebar/sidebar';

import { InstructorDataService } from '../../services/instructor-data.service';
import { CurriculumQuiz, CurriculumSection } from '../../mock-types';

@Component({
  selector: 'app-instructor-quiz',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    InstructorSidebar
  ],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css'
})
export class InstructorQuiz implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly dataService =
    inject(InstructorDataService);

  protected sectionId =
    this.route.snapshot.queryParamMap.get(
      'section'
    ) || '';

  protected quizId =
    this.route.snapshot.queryParamMap.get(
      'quiz'
    ) ||
    '';

  protected courseTitle =
    this.route.snapshot.queryParamMap.get(
      'course'
    ) ||
    'Course Curriculum';

  protected courseId =
    this.route.snapshot.queryParamMap.get(
      'courseId'
    ) ||
    '';

  protected type:
    'Lesson' | 'Section' =
    this.route.snapshot.queryParamMap.get(
      'type'
    ) === 'Section'
      ? 'Section'
      : 'Lesson';

  protected lessonId =
    this.route.snapshot.queryParamMap.get(
      'lesson'
    ) ||
    '';

  protected title = '';

  protected description = '';

  protected passingScore = 70;

  protected duration = '10 minutes';

  protected questions:
    any[] = [];

  protected sections: CurriculumSection[] = [];

  protected get currentSection():
    CurriculumSection | undefined {

    return this.sections.find(
      (section) =>
        section.id ===
        this.sectionId
    );
  }

  protected get lessons() {
    return this.currentSection?.lessons || [];
  }

  ngOnInit(): void {

    if (!this.courseId) return;

    this.dataService.getCurriculum(this.courseId).subscribe({
      next: (sections) => {
        this.sections = sections;
        this.hydrate();
      },
      error: (err) => console.error('Error fetching quiz:', err),
    });
  }


  private hydrate(): void {

    const existing =
      this.currentSection
        ?.quizzes.find(
          (quiz) =>
            quiz.id ===
            this.quizId
        );

    if (existing) {

      this.title =
        existing.title;

      this.passingScore =
        existing.passingScore;

      this.type =
        existing.type;

      this.lessonId =
        existing.lessonId || '';

      this.questions =
        existing.questions.map(
          (question) => ({
            id: crypto.randomUUID(),
            text: question.question,
            type: 'Multiple Choice',
            options: [
              ...question.options
            ],
            correctAnswer:
              question.correctAnswer ?? '',
            points:
              question.points ?? 1
          })
        );
    }

    if (
      !this.questions.length
    ) {
      this.addQuestion();
    }

    if (
      this.type === 'Lesson' &&
      !this.lessonId &&
      this.lessons.length
    ) {

      this.lessonId =
        this.lessons[0].id;
    }
  }

  onQuizTypeChange(): void {

    if (
      this.type === 'Section'
    ) {
      this.lessonId = '';
      return;
    }

    if (
      !this.lessonId &&
      this.lessons.length
    ) {
      this.lessonId =
        this.lessons[0].id;
    }
  }

  addQuestion(): void {

    this.questions.push({

      id:
        crypto.randomUUID(),

      text:
        '',

      type:
        'Multiple Choice',

      options: [
        '',
        '',
        '',
        ''
      ],

      correctAnswer:
        '',

      points:
        1
    });
  }

  removeQuestion(
    index: number
  ): void {

    if (
      this.questions.length <= 1
    ) {
      return;
    }

    this.questions.splice(
      index,
      1
    );
  }

  saveQuiz(): void {

    if (
      !this.title.trim()
    ) {

      Swal.fire('Notice', 'Please enter a quiz title.'
      , 'info');

      return;
    }

    if (
      this.type === 'Lesson' &&
      !this.lessonId
    ) {

      Swal.fire('Notice', 'Please select the lesson this quiz belongs to.'
      , 'info');

      return;
    }

    if (
      this.type === 'Lesson'
    ) {

      const lesson =
        this.lessons.find(
          (item: any) =>
            item.id ===
            this.lessonId
        );

      if (!lesson) {

        Swal.fire('Notice', 'The selected lesson could not be found.'
        , 'info');

        return;
      }

      const existingLessonQuiz =
        this.currentSection?.quizzes.find(
          (quiz: any) =>
            quiz.id !== this.quizId &&
            quiz.type === 'Lesson' &&
            quiz.lessonId ===
              this.lessonId
        );

      if (existingLessonQuiz) {

        Swal.fire('Notice', 'This lesson already has a quiz.'
        , 'info');

        return;
      }
    }

    if (
      this.type === 'Section'
    ) {

      const existingFinalQuiz =
        this.currentSection?.quizzes.find(
          (quiz: any) =>
            quiz.id !== this.quizId &&
            quiz.type === 'Section'
        );

      if (existingFinalQuiz) {

        Swal.fire('Notice', 'This section already has a final quiz.'
        , 'info');

        return;
      }
    }

    const questions =
      this.questions.map(
        (question: any) => ({

          ...question,

          text:
            question.text.trim(),

          options:
            question.options.map(
              (option: any) =>
                option.trim()
            ),

          correctAnswer:
            question.correctAnswer.trim(),

          points:
            Number(question.points) || 1
        })
      );

    const hasInvalidQuestion =
      questions.some(
        (question: any) =>
          !question.text ||
          question.options.some(
            (option: any) =>
              !option
          ) ||
          !question.correctAnswer
      );

    if (
      hasInvalidQuestion
    ) {

      Swal.fire('Notice', 'Please complete all question fields and select a correct answer.'
      , 'info');

      return;
    }

    // The quiz schema stores `question` (not `text`) and has no
    // `description`, `duration`, `type` or `lessonId` fields - see dbQuizs.js.
    // The lesson link lives on Lesson.quizId and is set by the backend when
    // createQuiz receives a lessonId.
    const payload = {
      title: this.title.trim(),
      passingScore: Math.min(100, Math.max(0, Number(this.passingScore) || 0)),
      questions: questions.map((question: any) => ({
        question: question.text.trim(),
        options: question.options.map((option: string) => option.trim()),
        correctAnswer: question.correctAnswer.trim(),
        points: Number(question.points) || 1
      }))
    };

    if (this.quizId) {
      // PATCH /Quiz/updateQuiz/:id
      this.dataService.updateQuiz(this.quizId, payload).subscribe({
        next: () => this.backToCurriculum(),
        error: (err) => {
          console.error('Failed to update quiz:', err);
          Swal.fire('Error', err?.error?.message || 'Unable to update this quiz.', 'error');
        },
      });
    } else {
      // POST /Quiz/createQuiz - targets a lesson (Lesson.quizId) or the
      // whole section (Quiz.sectionId) depending on the selected type.
      const target =
        this.type === 'Section'
          ? { sectionId: this.sectionId }
          : { lessonId: this.lessonId };
      this.dataService.createQuiz(target, payload).subscribe({
        next: () => this.backToCurriculum(),
        error: (err) => {
          console.error('Failed to create quiz:', err);
          Swal.fire('Error', err?.error?.message || 'Unable to create this quiz.', 'error');
        },
      });
    }
  }

  backToCurriculum(): void {

    this.router.navigate(
      ['/instructor-course-curriculum'],
      {
        queryParams: {
          course:
            this.courseTitle,

          courseId:
            this.courseId
        }
      }
    );
  }
}




