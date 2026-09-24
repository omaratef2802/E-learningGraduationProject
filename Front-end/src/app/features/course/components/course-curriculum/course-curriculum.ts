import { Component, Input, OnInit, inject } from '@angular/core';
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

  ngOnInit(): void {
    // Open section 1 by default (s1 is always unlocked)
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

  isUnlocked(id: string): boolean {
    return this.progressService.isUnlocked(id);
  }

  isPassed(id: string): boolean {
    return this.progressService.isPassed(id);
  }

  toggle(id: string): void {
    if (!this.isUnlocked(id)) {
      const secIdx = this.sections.findIndex((s) => s._id === id);
      const prevSecNum = secIdx > 0 ? secIdx : 1;
      this.lockedNotice = `🔒 Section is locked! Pass Section ${prevSecNum} Exam with ≥ 60% to unlock this section.`;
      setTimeout(() => {
        this.lockedNotice = '';
      }, 4000);
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

  resetDemoProgress(): void {
    this.progressService.resetProgress();
    this.openSections = new Set(['s1']);
  }

  unlockAllDemo(): void {
    this.progressService.unlockAll();
    this.sections.forEach((s) => this.openSections.add(s._id));
  }
}