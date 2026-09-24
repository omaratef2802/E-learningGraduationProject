import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ILesson, ISection } from '../../models';
import { CourseProgressService } from '../../course-progress';

@Component({
  selector: 'app-course-curriculum',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-curriculum.html',
  styleUrl: './course-curriculum.css',
})
export class CourseCurriculum implements OnInit {
  @Input() sections: ISection[] = [];
  @Input() lessons: ILesson[] = [];

  progressService = inject(CourseProgressService);
  openSections = new Set<string>();
  lockedNotice = '';

  // Interactive Lesson Test Player Modal
  activeLesson = signal<ILesson | null>(null);

  ngOnInit(): void {
    // Open section 1 by default if enrolled
    if (this.sections.length > 0) {
      this.openSections.add(this.sections[0]._id);
      if (this.progressService.isPassed('s1')) {
        this.openSections.add('s2');
      }
      if (this.progressService.isPassed('s2')) {
        this.openSections.add('s3');
      }
    }
  }

  isEnrolled(): boolean {
    return this.progressService.isEnrolled();
  }

  enrollNow(): void {
    this.progressService.enroll();
    this.lockedNotice = '🎉 Course enrolled successfully! Section 1, Lesson 1 is now unlocked.';
    setTimeout(() => (this.lockedNotice = ''), 4000);
  }

  toggleEnrollment(): void {
    this.progressService.toggleEnrollment();
    if (this.isEnrolled()) {
      this.openSections.add('s1');
      this.lockedNotice = '💳 Enrolled state activated! Content is now accessible.';
    } else {
      this.lockedNotice = '🔒 Unenrolled state activated! Course content is locked.';
    }
    setTimeout(() => (this.lockedNotice = ''), 4000);
  }

  isUnlocked(id: string): boolean {
    return this.progressService.isUnlocked(id);
  }

  isPassed(id: string): boolean {
    return this.progressService.isPassed(id);
  }

  isLessonUnlocked(id: string): boolean {
    return this.progressService.isLessonUnlocked(id);
  }

  isLessonWatched(id: string): boolean {
    return this.progressService.isLessonWatched(id);
  }

  isLessonQuizUnlocked(id: string): boolean {
    return this.progressService.isLessonQuizUnlocked(id);
  }

  isLessonQuizPassed(id: string): boolean {
    return this.progressService.isLessonQuizPassed(id);
  }

  isSectionExamUnlocked(secId: string): boolean {
    return this.progressService.isSectionExamUnlocked(secId);
  }

  toggle(id: string): void {
    if (!this.isEnrolled()) {
      this.showNotice('🔒 Course is locked! Please enroll in this course to access sections.');
      return;
    }

    if (!this.isUnlocked(id)) {
      const secIdx = this.sections.findIndex((s) => s._id === id);
      const prevSecNum = secIdx > 0 ? secIdx : 1;
      this.showNotice(`🔒 Section is locked! Pass Section ${prevSecNum} Exam with ≥ 60% to unlock this section.`);
      return;
    }

    if (this.openSections.has(id)) {
      this.openSections.delete(id);
    } else {
      this.openSections.add(id);
    }
  }

  isOpen(id: string): boolean {
    return this.isUnlocked(id) && this.openSections.has(id);
  }

  toggleAll(): void {
    if (!this.isEnrolled()) {
      this.showNotice('🔒 Course is locked! Please enroll to expand curriculum content.');
      return;
    }

    const unlockedList = this.sections.filter((s) => this.isUnlocked(s._id));
    if (this.openSections.size >= unlockedList.length) {
      this.openSections.clear();
    } else {
      unlockedList.forEach((s) => this.openSections.add(s._id));
    }
  }

  get allExpanded(): boolean {
    const unlockedList = this.sections.filter((s) => this.isUnlocked(s._id));
    return unlockedList.length > 0 && this.openSections.size >= unlockedList.length;
  }

  lessonsOf(sectionId: string): ILesson[] {
    return this.lessons
      .filter((l) => (typeof l.sectionId === 'string' ? l.sectionId : l.sectionId._id) === sectionId)
      .sort((a, b) => a.order - b.order);
  }

  sectionDuration(id: string): number {
    return this.lessonsOf(id).reduce((s, l) => s + l.duration, 0);
  }

  formatDuration(sec: number): string {
    return `${Math.round(sec / 60)} min`;
  }

  get totalDuration(): number {
    return this.lessons.reduce((s, l) => s + l.duration, 0);
  }

  // Lesson Viewer Modal Actions
  openLesson(les: ILesson): void {
    if (!this.isEnrolled()) {
      this.showNotice('🔒 Course is locked! Please enroll to watch this lecture.');
      return;
    }
    if (!this.isLessonUnlocked(les._id)) {
      this.showNotice('🔒 Lesson is locked! Complete the previous lesson and pass its quiz with ≥ 60% first.');
      return;
    }
    this.activeLesson.set(les);
  }

  closeLessonModal(): void {
    this.activeLesson.set(null);
  }

  completeLesson(lessonId: string): void {
    this.progressService.markLessonWatched(lessonId);
  }

  showNotice(msg: string): void {
    this.lockedNotice = msg;
    setTimeout(() => {
      this.lockedNotice = '';
    }, 4500);
  }

  // Demo Helpers
  resetDemoProgress(): void {
    this.progressService.resetProgress();
    this.openSections = new Set(['s1']);
    this.showNotice('↺ Progression reset. Course is now unenrolled and locked for fresh testing.');
  }

  unlockAllDemo(): void {
    this.progressService.unlockAll();
    this.sections.forEach((s) => this.openSections.add(s._id));
    this.showNotice('🔓 Full access preview mode activated! All lessons and quizzes are unlocked.');
  }
}