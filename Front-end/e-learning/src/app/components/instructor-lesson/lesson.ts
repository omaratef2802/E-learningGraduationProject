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
import { CurriculumLesson, LessonType } from '../../mock-types';

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
export class InstructorLesson implements OnInit {

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

  ngOnInit(): void {

    if (!this.courseId) return;

    this.dataService.getCurriculum(this.courseId).subscribe({
      next: (sections) => {
        const existing = sections
          .find((section) => section.id === this.sectionId)
          ?.lessons.find((lesson) => lesson.id === this.lessonId);

        if (existing) {
          this.hydrate(existing);
        }
      },
      error: (err) => console.error('Error fetching lessons:', err),
    });
  }


  private hydrate(existing: CurriculumLesson): void {

    this.title = existing.title;
    this.description = this.description ?? '';
    this.type = existing.type === 'video' ? 'Video' : 'Document';
    this.content =
      existing.type === 'video'
        ? existing.videoUrl ?? ''
        : existing.textContent ?? '';
    this.duration = existing.duration != null ? String(existing.duration) : '';
    this.order = Number(existing.order ?? 1);
    this.preview = Boolean(existing.isPreview);
    this.existingQuizId = existing.quizId ?? '';

    if (existing.type === 'video') {
      this.videoName = existing.videoUrl ?? '';
    } else {
      this.documentName = existing.textContent ?? '';
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

    // The backend stores `type` as 'video' | 'text' (see dbLesson.js) and has no
// `description` field, so the description stays client-side only.
    const payload = {
      title: this.title.trim(),
      type: (this.type === 'Video' ? 'video' : 'text') as LessonType,
      duration: Number(this.duration) || 0,
      order: Number(this.order) || 1,
      isPreview: this.preview,
      sectionId: this.sectionId,
      courseId: this.courseId,
      ...(this.type === 'Video'
        ? { videoUrl: this.content.trim() }
        : { textContent: this.content.trim() }),
      ...(this.existingQuizId ? { quizId: this.existingQuizId } : {}),
    };

    // Lessons are created/updated through
    // POST|PATCH /lesson/course/:courseId. The create route accepts a video
    // upload, so a text-only lesson is the only case that works without one.
    const request$ = this.lessonId
      ? this.dataService.updateLesson(this.lessonId, payload)
      : this.dataService.createLesson(this.courseId, payload);

    request$.subscribe({
      next: () => this.backToCurriculum(),
      error: (err) => {
        console.error('Failed to save lesson:', err);
        Swal.fire(
          'Error',
          err?.error?.message || 'Failed to save lesson.',
          'error'
        );
      },
    });
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




