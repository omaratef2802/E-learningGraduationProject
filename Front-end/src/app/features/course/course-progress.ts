import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CourseProgressService {
  // Unlocked sections set (Section 1 's1' is unlocked by default)
  unlockedSections = signal<Set<string>>(this.loadUnlocked());
  
  // Passed sections set (where quiz score >= 60%)
  passedSections = signal<Set<string>>(this.loadPassed());

  private loadUnlocked(): Set<string> {
    try {
      const saved = localStorage.getItem('elearning_unlocked_sections');
      return saved ? new Set(JSON.parse(saved)) : new Set(['s1']);
    } catch {
      return new Set(['s1']);
    }
  }

  private loadPassed(): Set<string> {
    try {
      const saved = localStorage.getItem('elearning_passed_sections');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  }

  isUnlocked(sectionId: string): boolean {
    if (sectionId === 's1') return true;
    return this.unlockedSections().has(sectionId);
  }

  isPassed(sectionId: string): boolean {
    return this.passedSections().has(sectionId);
  }

  passSection(sectionId: string, nextSectionId?: string): void {
    const passed = new Set(this.passedSections());
    passed.add(sectionId);
    this.passedSections.set(passed);

    const unlocked = new Set(this.unlockedSections());
    unlocked.add(sectionId);
    if (nextSectionId) {
      unlocked.add(nextSectionId);
    }
    this.unlockedSections.set(unlocked);

    this.saveState();
  }

  unlockAll(): void {
    const all = new Set(['s1', 's2', 's3']);
    this.unlockedSections.set(all);
    this.passedSections.set(all);
    this.saveState();
  }

  resetProgress(): void {
    this.unlockedSections.set(new Set(['s1']));
    this.passedSections.set(new Set());
    this.saveState();
  }

  private saveState(): void {
    try {
      localStorage.setItem('elearning_unlocked_sections', JSON.stringify(Array.from(this.unlockedSections())));
      localStorage.setItem('elearning_passed_sections', JSON.stringify(Array.from(this.passedSections())));
    } catch {}
  }
}
