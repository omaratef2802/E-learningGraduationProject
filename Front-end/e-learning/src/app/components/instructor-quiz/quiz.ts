import {
  Component,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  InstructorData,
  CurriculumQuiz,
  QuizQuestion,
  CurriculumSection
} from '../../page/instructor-data';

import {
  InstructorSidebar
} from '../../page/instructor-sidebar/sidebar';

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
export class InstructorQuiz {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly data =
    inject(InstructorData);

  protected sectionId =
    this.route.snapshot.queryParamMap.get(
      'section'
    ) ||
    this.data.sections[0]?.id ||
    '';

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
    QuizQuestion[] = [];

  protected get currentSection():
    CurriculumSection | undefined {

    return this.data.sections.find(
      section =>
        section.id ===
        this.sectionId
    );
  }

  protected get lessons() {
    return this.currentSection?.lessons || [];
  }

  constructor() {

    const existing =
      this.currentSection
        ?.quizzes.find(
          quiz =>
            quiz.id ===
            this.quizId
        );

    if (existing) {

      this.title =
        existing.title;

      this.description =
        existing.description;

      this.passingScore =
        existing.passingScore;

      this.duration =
        existing.duration;

      this.type =
        existing.type;

      this.lessonId =
        existing.lessonId || '';

      this.questions =
        existing.questions.map(
          question => ({
            ...question,
            options: [
              ...question.options
            ]
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

      alert(
        'Please enter a quiz title.'
      );

      return;
    }

    if (
      this.type === 'Lesson' &&
      !this.lessonId
    ) {

      alert(
        'Please select the lesson this quiz belongs to.'
      );

      return;
    }

    if (
      this.type === 'Lesson'
    ) {

      const lesson =
        this.lessons.find(
          item =>
            item.id ===
            this.lessonId
        );

      if (!lesson) {

        alert(
          'The selected lesson could not be found.'
        );

        return;
      }

      const existingLessonQuiz =
        this.currentSection?.quizzes.find(
          quiz =>
            quiz.id !== this.quizId &&
            quiz.type === 'Lesson' &&
            quiz.lessonId ===
              this.lessonId
        );

      if (existingLessonQuiz) {

        alert(
          'This lesson already has a quiz.'
        );

        return;
      }
    }

    if (
      this.type === 'Section'
    ) {

      const existingFinalQuiz =
        this.currentSection?.quizzes.find(
          quiz =>
            quiz.id !== this.quizId &&
            quiz.type === 'Section'
        );

      if (existingFinalQuiz) {

        alert(
          'This section already has a final quiz.'
        );

        return;
      }
    }

    const questions =
      this.questions.map(
        question => ({

          ...question,

          text:
            question.text.trim(),

          options:
            question.options.map(
              option =>
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
        question =>
          !question.text ||
          question.options.some(
            option =>
              !option
          ) ||
          !question.correctAnswer
      );

    if (
      hasInvalidQuestion
    ) {

      alert(
        'Please complete all question fields and select a correct answer.'
      );

      return;
    }

    const payload:
      Omit<CurriculumQuiz, 'id'> = {

      title:
        this.title.trim(),

      description:
        this.description.trim(),

      passingScore:
        Math.min(
          100,
          Math.max(
            0,
            Number(
              this.passingScore
            ) || 0
          )
        ),

      duration:
        this.duration.trim() ||
        'Untimed',

      questions,

      type:
        this.type,

      lessonId:
        this.type === 'Lesson'
          ? this.lessonId
          : undefined
    };

    if (
      this.quizId
    ) {

      const updated =
        this.data.updateQuiz(
          this.sectionId,
          this.quizId,
          payload
        );

      if (!updated) {

        alert(
          'Unable to update this quiz.'
        );

        return;
      }

    } else {

      const quizId =
        this.data.addQuiz(
          this.sectionId,
          payload
        );

      if (!quizId) {

        alert(
          this.type === 'Lesson'
            ? 'This lesson already has a quiz.'
            : 'This section already has a final quiz.'
        );

        return;
      }
    }

    this.backToCurriculum();
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