import Swal from 'sweetalert2';
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
  CurriculumLesson
} from '../../page/instructor-data';

import {
  InstructorSidebar
} from '../../page/instructor-sidebar/sidebar';

@Component({
  selector: 'app-instructor-lesson',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    InstructorSidebar
  ],
  templateUrl: './lesson.html',
  styleUrl: './lesson.css'
})
export class InstructorLesson {

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

  protected lessonId =
    this.route.snapshot.queryParamMap.get(
      'lesson'
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

  protected title = '';

  protected description = '';

  protected type:
    'Video' | 'Document' =
    'Video';

  protected content = '';

  protected duration = '';

  protected order = 1;

  protected preview = false;

  protected videoName = '';

  protected documentName = '';

  protected existingQuizId:
    string | undefined;

  constructor() {

    const existing =
      this.data.sections
        .find(
          section =>
            section.id ===
            this.sectionId
        )
        ?.lessons.find(
          lesson =>
            lesson.id ===
            this.lessonId
        );

    if (existing) {

      this.title =
        existing.title;

      this.description =
        existing.description;

      this.type =
        existing.type;

      this.content =
        existing.content;

      this.duration =
        existing.duration;

      this.order =
        existing.order;

      this.preview =
        existing.preview;

      this.existingQuizId =
        existing.quizId;

      if (
        existing.type === 'Video'
      ) {
        this.videoName =
          existing.content;
      } else {
        this.documentName =
          existing.content;
      }
    }
  }

  onTypeChange(): void {

    if (
      this.type === 'Video'
    ) {

      this.content = '';

      this.documentName = '';

      return;
    }

    this.content = '';

    this.videoName = '';
  }

  onVideoSelected(
    event: Event
  ): void {

    const file =
      (
        event.target as HTMLInputElement
      ).files?.[0];

    if (!file) {
      return;
    }

    this.videoName =
      file.name;

    this.content =
      file.name;
  }

  onDocumentSelected(
    event: Event
  ): void {

    const file =
      (
        event.target as HTMLInputElement
      ).files?.[0];

    if (!file) {
      return;
    }

    this.documentName =
      file.name;

    this.content =
      file.name;
  }

  saveLesson(): void {

    if (
      !this.title.trim()
    ) {

      Swal.fire('Notice', 'Please enter a lesson title.'
      , 'info');

      return;
    }

    if (
      !this.description.trim()
    ) {

      Swal.fire('Notice', 'Please enter a lesson description.'
      , 'info');

      return;
    }

    if (
      !this.content.trim()
    ) {

      Swal.fire('Notice', this.type === 'Video'
          ? 'Please add a video URL or upload a video.'
          : 'Please add document content or upload a document.'
      , 'info');

      return;
    }

    const payload:
      Omit<CurriculumLesson, 'id'> = {

      title:
        this.title.trim(),

      description:
        this.description.trim(),

      type:
        this.type,

      content:
        this.content.trim(),

      duration:
        this.duration.trim() ||
        'Self-paced',

      order:
        Number(this.order) || 1,

      preview:
        this.preview,

      quizId:
        this.existingQuizId
    };

    if (
      this.lessonId
    ) {

      this.data.updateLesson(
        this.sectionId,
        this.lessonId,
        payload
      );

    } else {

      this.data.addLesson(
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
          course:
            this.courseTitle,

          courseId:
            this.courseId
        }
      }
    );
  }
}