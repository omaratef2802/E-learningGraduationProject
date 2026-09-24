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
  QuizQuestion
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
    this.route.snapshot.queryParamMap.get('section') ||
    this.data.sections[0]?.id ||
    '';


  protected quizId =
    this.route.snapshot.queryParamMap.get('quiz') ||
    '';


  protected courseTitle =
    this.route.snapshot.queryParamMap.get('course') ||
    'Course Curriculum';


  protected title = '';

  protected description = '';

  protected passingScore = 70;

  protected duration = '10 minutes';

  protected questions: QuizQuestion[] = [];


  constructor() {

    const existing =
      this.data.sections
        .find(
          (section) =>
            section.id === this.sectionId
        )
        ?.quizzes.find(
          (quiz) =>
            quiz.id === this.quizId
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

      this.questions =
        existing.questions.map(
          (question) => ({
            ...question,
            options: [
              ...question.options
            ]
          })
        );

    }


    if (!this.questions.length) {
      this.addQuestion();
    }

  }


  addQuestion(): void {

    this.questions.push({

      id: crypto.randomUUID(),

      text: '',

      type: 'Multiple Choice',

      options: [
        '',
        '',
        '',
        ''
      ],

      correctAnswer: '',

      points: 1

    });

  }


  removeQuestion(index: number): void {

    if (this.questions.length <= 1) {
      return;
    }

    this.questions.splice(
      index,
      1
    );

  }


  saveQuiz(): void {

    const questions =
      this.questions.map(
        (question) => ({

          ...question,

          text:
            question.text.trim(),

          options:
            question.options.map(
              (option) =>
                option.trim()
            ),

          correctAnswer:
            question.correctAnswer.trim(),

          points:
            Number(question.points) || 1

        })
      );


    const payload:
      Omit<CurriculumQuiz, 'id'> = {

      title:
        this.title.trim() ||
        'Untitled Quiz',

      description:
        this.description.trim(),

      passingScore:
        Number(this.passingScore) || 0,

      duration:
        this.duration.trim() ||
        'Untimed',

      questions

    };


    if (this.quizId) {

      this.data.updateQuiz(
        this.sectionId,
        this.quizId,
        payload
      );

    } else {

      this.data.addQuiz(
        this.sectionId,
        payload
      );

    }


    this.backToCurriculum();

  }


  backToCurriculum(): void {

    this.router.navigate(
      ['/instructor-course-curriculum'],
      {
        queryParams: {
          course: this.courseTitle
        }
      }
    );

  }

}