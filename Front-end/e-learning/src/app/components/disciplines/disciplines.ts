import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DISCIPLINES_CONFIG, DisciplineItem } from './disciplines.config';
import { InstructorService } from '../../services/instructor.service';
import { Category } from '../../mock-types';

@Component({
  selector: 'app-disciplines',
  standalone: true,
  templateUrl: './disciplines.html',
  styleUrl: './disciplines.css',
})
export class Disciplines implements OnInit {
  private readonly router = inject(Router);
  private readonly backend = inject(InstructorService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected readonly config = DISCIPLINES_CONFIG;

  public loadedCategories: Category[] = [];
  private readonly courseCounts = new Map<string, number>();

  ngOnInit() {
    this.backend.getCategories().subscribe({
      next: (categories) => {
        this.loadedCategories = categories;
        this.changeDetector.detectChanges();
        this.backend.getAllCourses(50).subscribe({
          next: (courses) => {
            this.courseCounts.clear();
            for (const course of courses) {
              const categoryId = typeof course.category === 'object'
                ? course.category?._id
                : course.category;
              if (categoryId) {
                this.courseCounts.set(categoryId, (this.courseCounts.get(categoryId) ?? 0) + 1);
              }
            }
            this.changeDetector.detectChanges();
          },
          error: (err) => console.error('Error counting category courses:', err),
        });
      },
      error: (err) => console.error('Error fetching categories:', err)
    });
  }

  get disciplinesList(): DisciplineItem[] {
    const icons = ['◲', '文', '◇', '◆'];

    // Only the four categories the database exposes; nothing is hardcoded here.
    return this.loadedCategories.map((cat, idx) => ({
      icon: cat.icon || icons[idx % icons.length],
      label: cat.name,
      title: cat.name,
      description: cat.description || 'Develop practical skills and master real-world workflows in this discipline.',
      courses: `${this.courseCounts.get(cat._id) ?? 0} Courses`,
      query: cat.name,
      // The category id is what the catalog route needs; the name is only a
      // label and is not a reliable lookup key.
      categoryId: cat._id,
    }));
  }

  /**
   * Navigates to the catalog for one category. The route takes the category id,
   * so passing the name (as this used to) never matched anything.
   */
  explore(categoryId?: string, event?: Event): void {
    event?.stopPropagation();
    if (!categoryId) {
      this.router.navigate(['/courses']);
      return;
    }

    this.router.navigate(['/category', categoryId]);
  }

  /** "Browse all disciplines" goes to the full catalog. */
  exploreAll(): void {
    this.router.navigate(['/courses']);
  }
}

