import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import {
  Certificate,
  Category,
  Course,
  CourseStatus,
  CurriculumLesson,
  CurriculumQuiz,
  CurriculumSection,
  InstructorProfile,
  PublicInstructor,
  LessonType,
  Track,
} from '../mock-types';

/**
 * Single entry point for the instructor area.
 *
 * It replaces the deleted mock store (`page/instructor-data.ts`) and reads
 * everything from the backend in `Back-end/src`, which is backed by MongoDB.
 * Nothing here holds mock data: every value comes from an API response.
 */
@Injectable({ providedIn: 'root' })
export class InstructorDataService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:3000/E-learning';

  // =========================
  // HEADERS
  // =========================

  /**
   * The backend reads the JWT directly from `Authorization` (no `Bearer `
   * prefix) and requires it on every instructor-only route.
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';

    return new HttpHeaders({
      'Content-Type': 'application/json',
      authorization: token,
    });
  }

  // =========================
  // CATEGORIES / TRACKS (public)
  // =========================

  getCategories(): Observable<Category[]> {
    return this.http
      .get<{ categories: Category[] }>(`${this.base}/category/`)
      .pipe(map((res) => res.categories ?? []));
  }

  getTracks(): Observable<Track[]> {
    return this.http
      .get<{ tracks: Track[] }>(`${this.base}/track/`)
      .pipe(map((res) => res.tracks ?? []));
  }

  // =========================
  // INSTRUCTOR PROFILE
  // =========================

  getProfile(): Observable<InstructorProfile> {
    return this.http
      .get<{ data: InstructorProfile }>(`${this.base}/users/myProfile`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.data));
  }

  getPublicInstructors(): Observable<PublicInstructor[]> {
    return this.http
      .get<{ data: Course[] }>(`${this.base}/course?limit=50`)
      .pipe(
        map((res) => {
          const seen = new Set<string>();
          const instructors: PublicInstructor[] = [];

          for (const course of res.data ?? []) {
            const instructor = course.instructorId;
            if (!instructor || typeof instructor !== 'object' || seen.has(instructor._id)) {
              continue;
            }

            seen.add(instructor._id);
            instructors.push({
              _id: instructor._id,
              firstName: instructor.firstName,
              lastName: instructor.lastName,
            });
            if (instructors.length === 4) break;
          }

          return instructors;
        }),
      );
  }

  updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    img?: string | null;
  }): Observable<InstructorProfile> {
    return this.http
      .patch<{ data: InstructorProfile }>(`${this.base}/users/profile`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.data));
  }

  // =========================
  // COURSES (own only — instructor token)
  // =========================

  /**
   * GET /course is instructor-aware: when the request carries an instructor
   * JWT the backend filters by `instructorId`, so this returns only the
   * courses owned by the signed-in instructor.
   */
  getMyCourses(): Observable<unknown[]> {
    return this.http
      .get<{ data: unknown[] }>(`${this.base}/course/myCourses`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.data ?? []));
  }

  getMyStudents(): Observable<any[]> {
    return this.http
      .get<{ data?: any[] }>(`${this.base}/enroll/instructorStudents`, { headers: this.getHeaders() })
      .pipe(map((res) => res.data ?? []));
  }

  getNotifications(): Observable<any[]> {
    return this.http
      .get<{ notifications?: any[] }>(`${this.base}/Notification/getNotification`, { headers: this.getHeaders() })
      .pipe(map((res) => (res.notifications ?? []).map((notification) => ({
        ...notification,
        id: notification._id,
        title: notification.subject || notification.title || 'Notification',
      }))));
  }

  updateNotification(id: string, updates: { isRead?: boolean }): Observable<unknown> {
    return this.http.patch(`${this.base}/Notification/updateNotification/${id}`, updates, { headers: this.getHeaders() });
  }

  deleteNotification(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/Notification/deleteNotification/${id}`, { headers: this.getHeaders() });
  }

  /** PATCH /course/status/:id — the only state transition the backend accepts. */
  updateCourseStatus(
    courseId: string,
    status: CourseStatus,
  ): Observable<unknown> {
    return this.http.patch(
      `${this.base}/course/status/${courseId}`,
      { status },
      { headers: this.getHeaders() },
    );
  }

  getCourse(courseId: string): Observable<unknown> {
    return this.http
      .get<{ data: unknown }>(`${this.base}/course/${courseId}`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => res.data));
  }
// =========================
  // SECTIONS
  // =========================

  /**
   * Loads a course's sections together with their lessons and quizzes, which
   * is the shape the instructor dashboard renders. The backend stores lessons
   * separately and links quizzes through `Lesson.quizId`, so the nesting is
   * assembled here rather than in the API.
   */
  getCurriculum(courseId: string): Observable<CurriculumSection[]> {
    const headers = this.getHeaders();

    return this.http
      .get<{ data: any[] }>(`${this.base}/section/course/${courseId}`, { headers })
      .pipe(
        switchMap((res) => {
          const sections: any[] = res.data ?? [];

          if (!sections.length) return of([] as CurriculumSection[]);

          return forkJoin({
            lessons: this.http
              .get<{ data: any[] }>(`${this.base}/lesson/course/${courseId}`, { headers })
              .pipe(map((response) => response.data ?? [])),
            quizzes: this.getQuizzesForCourse(courseId).pipe(catchError(() => of([] as CurriculumQuiz[]))),
          }).pipe(map(({ lessons, quizzes }) => sections.map((section) => {
            const sectionId = String(section._id);
            const sectionLessons = lessons
              .filter((lesson) => String(lesson.sectionId?._id ?? lesson.sectionId) === sectionId)
              .sort((a, b) => a.order - b.order);

            return {
              id: sectionId,
              _id: sectionId,
              title: section.title,
              description: section.description ?? null,
              courseId: String(section.courseId?._id ?? section.courseId),
              order: section.order,
              lessons: sectionLessons.map((lesson) => ({ ...lesson, id: String(lesson._id) })),
              quizzes: quizzes
                .filter((quiz) => {
                  // A quiz belongs to this section when it is the section's
                  // final quiz (Quiz.sectionId) or the quiz of one of the
                  // section's lessons (Lesson.quizId).
                  const quizSectionId = String(quiz.sectionId ?? '');
                  if (quizSectionId && quizSectionId !== 'null' && quizSectionId !== 'undefined') {
                    return quizSectionId === sectionId;
                  }
                  return sectionLessons.some(
                    (lesson) => String(lesson.quizId?._id ?? lesson.quizId) === String(quiz._id),
                  );
                })
                .map((quiz) => {
                  const isSectionQuiz = Boolean(quiz.sectionId);
                  const linkedLesson = sectionLessons.find(
                    (lesson) => String(lesson.quizId?._id ?? lesson.quizId) === String(quiz._id),
                  );
                  return {
                    ...quiz,
                    id: String(quiz._id),
                    type: (isSectionQuiz ? 'Section' : 'Lesson') as 'Lesson' | 'Section',
                    lessonId: linkedLesson ? String(linkedLesson._id) : undefined,
                    sectionId: isSectionQuiz ? sectionId : undefined,
                  };
                }),
            } as CurriculumSection;
          })));
        }),
      );
  }

  createSection(
    courseId: string,
    data: { title: string; description?: string; order: number },
  ): Observable<unknown> {
    return this.http.post(`${this.base}/section/course/${courseId}`, data, {
      headers: this.getHeaders(),
    });
  }

  updateSection(
    sectionId: string,
    data: { title?: string; description?: string; order?: number },
  ): Observable<unknown> {
    return this.http.patch(`${this.base}/section/${sectionId}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteSection(sectionId: string): Observable<unknown> {
    return this.http.delete(`${this.base}/section/${sectionId}`, {
      headers: this.getHeaders(),
    });
  }
// =========================
  // LESSONS
  // =========================

  getLessons(courseId: string): Observable<CurriculumLesson[]> {
    return this.http
      .get<{ data: any[] }>(`${this.base}/lesson/course/${courseId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((res) =>
          (res.data ?? []).map((lesson) => ({ ...lesson, id: lesson._id })),
        ),
      );
  }

  /**
   * Creating a lesson goes through POST /lesson/course/:courseId. The backend
   * route accepts a multipart `video` upload for video lessons; a JSON body is
   * used here for text lessons, which is the case that needs no file.
   */
  createLesson(
    courseId: string,
    data: {
      title: string;
      type: LessonType;
      duration: number;
      order: number;
      isPreview: boolean;
      sectionId: string;
      textContent?: string;
      videoUrl?: string;
      quizId?: string;
    },
  ): Observable<unknown> {
    return this.http.post(`${this.base}/lesson/course/${courseId}`, data, {
      headers: this.getHeaders(),
    });
  }

  updateLesson(
    lessonId: string,
    data: Partial<{
      title: string;
      type: LessonType;
      duration: number;
      order: number;
      sectionId: string;
      textContent: string;
      isPreview: boolean;
      quizId: string | null;
    }>,
  ): Observable<unknown> {
    return this.http.patch(`${this.base}/lesson/${lessonId}`, data, {
      headers: this.getHeaders(),
    });
  }

  deleteLesson(lessonId: string): Observable<unknown> {
    return this.http.delete(`${this.base}/lesson/${lessonId}`, {
      headers: this.getHeaders(),
    });
  }

  // =========================
  // QUIZZES
  // =========================

  /** GET /Quiz/getQuizzes returns every quiz owned by the instructor. */
  getQuizzesForCourse(courseId: string): Observable<CurriculumQuiz[]> {
    return this.http
      .get<{ data: any[] }>(`${this.base}/Quiz/getQuizzes`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((res) =>
          (res.data ?? [])
            .filter((quiz) => quiz.courseId === courseId)
            .map((quiz) => ({ ...quiz, id: quiz._id })),
        ),
      );
  }

  getQuiz(quizId: string): Observable<CurriculumQuiz> {
    return this.http
      .get<{ data: any }>(`${this.base}/Quiz/getQuiz/${quizId}`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => ({ ...res.data, id: res.data._id })));
  }

  /**
   * POST /Quiz/createQuiz requires either a `lessonId` (lesson quiz — the
   * backend writes the id onto Lesson.quizId) or a `sectionId` (section final
   * quiz — the backend stores it on Quiz.sectionId).
   */
  createQuiz(
    target: { lessonId?: string; sectionId?: string },
    data: {
      title: string;
      passingScore: number;
      questions: {
        question: string;
        options: string[];
        correctAnswer: string;
        points: number;
      }[];
    },
  ): Observable<unknown> {
    return this.http.post(`${this.base}/Quiz/createQuiz`, {
      ...target,
      ...data,
    }, {
      headers: this.getHeaders(),
    });
  }

  updateQuiz(
    quizId: string,
    updates: {
      title?: string;
      questions?: {
        question: string;
        options: string[];
        correctAnswer: string;
        points: number;
      }[];
      passingScore?: number;
    },
  ): Observable<unknown> {
    return this.http.patch(
      `${this.base}/Quiz/updateQuiz/${quizId}`,
      updates,
      { headers: this.getHeaders() },
    );
  }

  deleteQuiz(quizId: string): Observable<unknown> {
    return this.http.delete(`${this.base}/Quiz/deleteQuiz/${quizId}`, {
      headers: this.getHeaders(),
    });
  }

  // =========================
  // CERTIFICATES
  // =========================

  /** Certificates are issued to students automatically on course completion. */
  getCertificates(): Observable<Certificate[]> {
    return this.http
      .get<{ data: any[] }>(`${this.base}/certificate/instructorCertificates`, {
        headers: this.getHeaders(),
      })
      .pipe(map((res) => (res.data ?? []).map((cert) => ({ ...cert, id: cert._id }))));
  }

  verifyCertificate(certificateId: string): Observable<Certificate> {
    return this.http
      .get<{ data: any }>(`${this.base}/certificate/verify/${certificateId}`)
      .pipe(map((res) => ({ ...res.data, id: res.data._id })));
  }
}
