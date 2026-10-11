import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HERO_CONFIG } from './hero.config';
import { InstructorDataService } from '../../services/instructor-data.service';
import { Category } from '../../mock-types';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero implements OnInit {
  private readonly router = inject(Router);
  private readonly data = inject(InstructorDataService);

  protected readonly config = HERO_CONFIG;

  /** Categories come from the database via GET /category/. */
  protected categories: Category[] = [];

  ngOnInit(): void {
    this.data.getCategories().subscribe({
      next: (categories) => (this.categories = categories),
      error: (err) => console.error('Error fetching categories:', err),
    });
  }

  get quickSearches(): string[] {
    if (this.categories.length > 0) {
      return this.categories.slice(0, 4).map((c) => c.name);
    }
    return this.config.quickSearches;
  }

  search(query: string): void {
    const value = query.trim();
    this.router.navigate(['/search'], { queryParams: value ? { q: value } : {} });
  }
}

