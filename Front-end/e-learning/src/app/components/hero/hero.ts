import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HERO_CONFIG } from './hero.config';
import { InstructorData } from '../../page/instructor-data';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private readonly router = inject(Router);
  protected readonly data = inject(InstructorData);
  protected readonly config = HERO_CONFIG;

  get quickSearches(): string[] {
    if (this.data.adminCategories && this.data.adminCategories.length > 0) {
      return this.data.adminCategories.slice(0, 4).map(c => c.name);
    }
    return this.config.quickSearches;
  }

  search(query: string): void {
    const value = query.trim();
    this.router.navigate(['/search'], { queryParams: value ? { q: value } : {} });
  }
}
