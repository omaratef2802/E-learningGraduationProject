import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DISCIPLINES_CONFIG, DisciplineItem } from './disciplines.config';
import { InstructorData } from '../../page/instructor-data';

@Component({
  selector: 'app-disciplines',
  standalone: true,
  templateUrl: './disciplines.html',
  styleUrl: './disciplines.css',
})
export class Disciplines {
  private readonly router = inject(Router);
  protected readonly data = inject(InstructorData);
  protected readonly config = DISCIPLINES_CONFIG;

  get disciplinesList(): DisciplineItem[] {
    const categories = this.data.adminCategories;
    const icons = ['⌘', '文', '◒', '↗', '◈', '✦'];
    if (categories && categories.length > 0) {
      return categories.slice(0, 4).map((cat, idx) => ({
        icon: icons[idx % icons.length],
        label: cat.name,
        title: cat.name,
        description: cat.description || 'Develop practical skills and master real-world workflows in this discipline.',
        courses: `${cat.coursesCount || 10}+ Courses`,
        query: cat.name
      }));
    }
    return this.config.items;
  }

  explore(query: string): void {
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }
}
