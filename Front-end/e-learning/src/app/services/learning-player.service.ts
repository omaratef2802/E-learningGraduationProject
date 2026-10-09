import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface PlayerLesson {
  id: string;
  title: string;
  duration?: number;
  type: 'video' | 'text';
  order: number;
  isPreview?: boolean;
  quizId: string | null;
  unlocked: boolean;
  completed: boolean;
  quizPassed: boolean;
  score: number | null;
}

export interface PlayerQuiz {
  id: string;
  title: string;
  unlocked: boolean;
  passed: boolean;
  score: number | null;
}

export interface PlayerSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  unlocked: boolean;
  completed: boolean;
  lessons: PlayerLesson[];
  finalQuiz: PlayerQuiz | null;
}

export interface PlayerState {
  sections: PlayerSection[];
  enrollment: {
    _id: string;
    progress: number;
    status: string;
    completedLessons: string[];
  };
  course?: {
    _id: string;
    title: string;
    image?: string;
    instructorId?: { firstName?: string; lastName?: string };
  };
}

export interface LessonContent {
  _id: string;
  title: string;
  type: 'video' | 'text';
  duration?: number;
  videoUrl?: string | null;
  textContent?: string | null;
  quizId?: { _id: string; title: string; passingScore: number } | null;
  sectionId?: { title?: string; order?: number } | string | null;
  order?: number;
}

export interface QuizContent {
  _id: string;
  title: string;
  passingScore: number;
  sectionId?: string | null;
  questions: Array<{
    _id?: string;
    question: string;
    options: string[];
    points: number;
  }>;
}

export interface PlayerCertificate {
  _id: string;
  course?: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  issueDate: string;
  verificationUrl: string;
  qrCode?: string;
}

export interface QuizResult {
  attempt: {
    _id: string;
    quiz: string;
    course: string;
    lesson: string | null;
    score: number;
    totalScore: number;
    percentage: number;
    passed: boolean;
  };
  sections: PlayerSection[];
  enrollment: PlayerState['enrollment'];
  certificate: PlayerCertificate | null;
}

@Injectable({ providedIn: 'root' })
export class LearningPlayerService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:3000/E-learning/learning';

  private headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: localStorage.getItem('token') || '' });
  }

  /** Full state: every section with its lock/scores for this student. */
  getCourseState(courseId: string): Observable<PlayerState> {
    return this.http
      .get<{ data: PlayerState }>(`${this.base}/${courseId}/state`, { headers: this.headers() })
      .pipe(map((response) => response.data));
  }

  /** Lesson content — the backend refuses locked lessons with a 403. */
  getLesson(courseId: string, lessonId: string): Observable<LessonContent> {
    return this.http
      .get<{ data: LessonContent }>(`${this.base}/${courseId}/lesson/${lessonId}`, {
        headers: this.headers(),
      })
      .pipe(map((response) => response.data));
  }

  /** Marks a lesson complete and returns the refreshed state. */
  completeLesson(courseId: string, lessonId: string): Observable<PlayerState> {
    return this.http
      .post<{ data: PlayerState }>(
        `${this.base}/${courseId}/lesson/${lessonId}/complete`,
        {},
        { headers: this.headers() },
      )
      .pipe(map((response) => response.data));
  }

  /** Quiz content without the correct answers. */
  getQuiz(quizId: string): Observable<QuizContent> {
    return this.http
      .get<{ data: QuizContent }>(`${this.base}/quiz/${quizId}`, { headers: this.headers() })
      .pipe(map((response) => response.data));
  }

  /** Every certificate this student has earned (used to re-show a past one). */
  getMyCertificates(): Observable<PlayerCertificate[]> {
    return this.http
      .get<{ data?: PlayerCertificate[] }>('http://localhost:3000/E-learning/certificate/myCertificates', {
        headers: this.headers(),
      })
      .pipe(map((response) => response.data ?? []));
  }

  /** Submits answers for server-side grading; returns the score and new state. */
  submitQuiz(
    quizId: string,
    studentAnswers: Array<{ questionIndex: number; selectedAnswer: string }>,
    lessonId?: string,
  ): Observable<QuizResult> {
    return this.http
      .post<{ data: QuizResult }>(
        `${this.base}/quiz/${quizId}/attempt`,
        { studentAnswers, lessonId },
        { headers: this.headers() },
      )
      .pipe(map((response) => response.data));
  }
}
