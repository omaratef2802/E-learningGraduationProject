import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CourseProgressService {
  // Storage key prefix (v4 ensures fresh clean slate without any corrupted old test state)
  private readonly PREFIX = 'elearning_v4_';

  // 1. Enrollment status (Course Payment Validation)
  isEnrolled = signal<boolean>(this.loadEnrolled());

  // 2. Watched lessons set ('l1', 'l2', ...)
  watchedLessons = signal<Set<string>>(this.loadSet('watched_lessons'));

  // 3. Passed quizzes set ('quiz_l1', 'quiz_l2', ..., 's1', 's2', 's3')
  passedQuizzes = signal<Set<string>>(this.loadSet('passed_quizzes'));

  // 4. Unlocked sections set ('s1', 's2', 's3')
  unlockedSections = signal<Set<string>>(this.loadUnlocked());

  // 5. Passed sections set ('s1', 's2', 's3')
  passedSections = signal<Set<string>>(this.loadSet('passed_sections'));

  // ==========================================
  // Enrollment / Payment Operations
  // ==========================================
  enroll(): void {
    this.isEnrolled.set(true);
    const uSec = new Set(this.unlockedSections());
    uSec.add('s1');
    this.unlockedSections.set(uSec);
    this.saveState();
  }

  unenroll(): void {
    this.isEnrolled.set(false);
    this.resetProgress();
  }

  toggleEnrollment(): void {
    if (this.isEnrolled()) {
      this.unenroll();
    } else {
      this.enroll();
    }
  }

  // ==========================================
  // Lesson Progression Operations
  // ==========================================
  /**
   * Rule: First lesson (l1) is available once enrolled.
   * Subsequent lessons unlock ONLY after the previous lesson's quiz is passed!
   * Lesson 4 unlocks ONLY after Section 1 Comprehensive Exam (s1) is passed!
   * Lesson 7 unlocks ONLY after Section 2 Comprehensive Exam (s2) is passed!
   */
  isLessonUnlocked(lessonId: string): boolean {
    if (!this.isEnrolled()) return false;
    if (lessonId === 'l1') return true;

    const prereqMap: Record<string, string> = {
      l2: 'quiz_l1',
      l3: 'quiz_l2',
      l4: 's1',       // Requires Section 1 Comprehensive Exam passed
      l5: 'quiz_l4',
      l6: 'quiz_l5',
      l7: 's2',       // Requires Section 2 Comprehensive Exam passed
      l8: 'quiz_l7',
    };

    const prereq = prereqMap[lessonId];
    if (!prereq) return false;
    return this.passedQuizzes().has(prereq);
  }

  isLessonWatched(lessonId: string): boolean {
    return this.watchedLessons().has(lessonId);
  }

  markLessonWatched(lessonId: string): void {
    const watched = new Set(this.watchedLessons());
    watched.add(lessonId);
    this.watchedLessons.set(watched);
    this.saveState();
  }

  // ==========================================
  // Lesson Quiz Operations
  // ==========================================
  /**
   * Rule: The quiz for a lesson is LOCKED until the user watches that lesson!
   */
  isLessonQuizUnlocked(lessonId: string): boolean {
    if (!this.isEnrolled()) return false;
    return this.isLessonUnlocked(lessonId) && this.isLessonWatched(lessonId);
  }

  isLessonQuizPassed(lessonId: string): boolean {
    return this.passedQuizzes().has('quiz_' + lessonId);
  }

  // ==========================================
  // Section & Section Exam Operations
  // ==========================================
  /**
   * Section 1 is unlocked once enrolled.
   * Section 2 is unlocked ONLY when Section 1 Exam (s1) is passed!
   * Section 3 is unlocked ONLY when Section 2 Exam (s2) is passed!
   */
  isUnlocked(sectionId: string): boolean {
    if (!this.isEnrolled()) return false;
    if (sectionId === 's1') return true;
    if (sectionId === 's2') return this.passedSections().has('s1');
    if (sectionId === 's3') return this.passedSections().has('s2');
    return false;
  }

  isPassed(sectionId: string): boolean {
    return this.passedSections().has(sectionId);
  }

  /**
   * Rule: Section Comprehensive Exam unlocks ONLY after ALL lesson quizzes
   * in that section are completed and passed!
   */
  isSectionExamUnlocked(sectionId: string): boolean {
    if (!this.isEnrolled()) return false;
    if (!this.isUnlocked(sectionId)) return false;

    const sectionLessons: Record<string, string[]> = {
      s1: ['l1', 'l2', 'l3'],
      s2: ['l4', 'l5', 'l6'],
      s3: ['l7', 'l8'],
    };

    const lessons = sectionLessons[sectionId] || [];
    return lessons.every((lId) => this.passedQuizzes().has('quiz_' + lId));
  }

  /**
   * Record a passed quiz or exam (score >= 60%)
   * STRICT SEPARATION:
   * - Passing a lesson quiz (quiz_l1..quiz_l8) ONLY unlocks the next lesson.
   * - The next section unlocks ONLY when the Section Comprehensive Exam (s1, s2) is passed!
   * - The Certificate unlocks ONLY when the Capstone Exam (s3) is passed!
   */
  passQuiz(quizId: string): void {
    const passed = new Set(this.passedQuizzes());
    passed.add(quizId);
    this.passedQuizzes.set(passed);

    // Section 1 Comprehensive Exam passed!
    if (quizId === 's1' || quizId === 'quiz-s1') {
      passed.add('s1');
      this.passedQuizzes.set(passed);

      const pSec = new Set(this.passedSections());
      pSec.add('s1');
      this.passedSections.set(pSec);

      const uSec = new Set(this.unlockedSections());
      uSec.add('s1');
      uSec.add('s2'); // Section 2 is NOW unlocked!
      this.unlockedSections.set(uSec);
    } 
    // Section 2 Comprehensive Exam passed!
    else if (quizId === 's2' || quizId === 'quiz-s2') {
      passed.add('s2');
      this.passedQuizzes.set(passed);

      const pSec = new Set(this.passedSections());
      pSec.add('s2');
      this.passedSections.set(pSec);

      const uSec = new Set(this.unlockedSections());
      uSec.add('s2');
      uSec.add('s3'); // Section 3 is NOW unlocked!
      this.unlockedSections.set(uSec);
    } 
    // Section 3 Capstone Exam passed!
    else if (quizId === 's3' || quizId === 'quiz-s3') {
      passed.add('s3');
      this.passedQuizzes.set(passed);

      const pSec = new Set(this.passedSections());
      pSec.add('s3');
      this.passedSections.set(pSec);
    }

    this.saveState();
  }

  // ==========================================
  // Demo / Testing Helpers
  // ==========================================
  unlockAll(): void {
    this.isEnrolled.set(true);
    this.watchedLessons.set(new Set(['l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8']));
    this.passedQuizzes.set(
      new Set([
        'quiz_l1',
        'quiz_l2',
        'quiz_l3',
        's1',
        'quiz_l4',
        'quiz_l5',
        'quiz_l6',
        's2',
        'quiz_l7',
        'quiz_l8',
        's3',
      ])
    );
    this.unlockedSections.set(new Set(['s1', 's2', 's3']));
    this.passedSections.set(new Set(['s1', 's2', 's3']));
    this.saveState();
  }

  resetProgress(): void {
    this.isEnrolled.set(false);
    this.watchedLessons.set(new Set());
    this.passedQuizzes.set(new Set());
    this.unlockedSections.set(new Set(['s1']));
    this.passedSections.set(new Set());
    try {
      localStorage.removeItem(this.PREFIX + 'is_enrolled');
      localStorage.removeItem(this.PREFIX + 'watched_lessons');
      localStorage.removeItem(this.PREFIX + 'passed_quizzes');
      localStorage.removeItem(this.PREFIX + 'unlocked_sections');
      localStorage.removeItem(this.PREFIX + 'passed_sections');
    } catch {}
    this.saveState();
  }

  // ==========================================
  // Persistence Utilities
  // ==========================================
  private loadEnrolled(): boolean {
    try {
      const val = localStorage.getItem(this.PREFIX + 'is_enrolled');
      return val !== null ? JSON.parse(val) : false;
    } catch {
      return false;
    }
  }

  private loadUnlocked(): Set<string> {
    const set = this.loadSet('unlocked_sections', ['s1']);
    const passed = this.loadSet('passed_sections');
    if (passed.has('s1')) set.add('s2');
    if (passed.has('s2')) set.add('s3');
    return set;
  }

  private loadSet(key: string, defaults: string[] = []): Set<string> {
    try {
      const saved = localStorage.getItem(this.PREFIX + key);
      return saved ? new Set(JSON.parse(saved)) : new Set(defaults);
    } catch {
      return new Set(defaults);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(this.PREFIX + 'is_enrolled', JSON.stringify(this.isEnrolled()));
      localStorage.setItem(this.PREFIX + 'watched_lessons', JSON.stringify(Array.from(this.watchedLessons())));
      localStorage.setItem(this.PREFIX + 'passed_quizzes', JSON.stringify(Array.from(this.passedQuizzes())));
      localStorage.setItem(this.PREFIX + 'unlocked_sections', JSON.stringify(Array.from(this.unlockedSections())));
      localStorage.setItem(this.PREFIX + 'passed_sections', JSON.stringify(Array.from(this.passedSections())));
    } catch {}
  }
}
