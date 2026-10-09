import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { InstructorService } from '../../../services/instructor.service';
import { Category } from '../../../mock-types';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  private readonly backend = inject(InstructorService);
  // Zoneless app: the HTTP callback has to schedule change detection itself.
  private readonly changeDetector = inject(ChangeDetectorRef);

  /** Every category from GET /category, nothing is hardcoded. */
  public loadedCategories: Category[] = [];

  public searchText = '';
  public selectedCategory = 'All';
  public isLoading = true;
  public errorMessage = '';

  /** Distinct category names, used by the filter pills. */
  public get categoryNames(): string[] {
    return this.loadedCategories.map((c) => c.name);
  }

  ngOnInit(): void {
    this.backend.getCategories().subscribe({
      next: (categories) => {
        this.loadedCategories = categories;
        this.changeDetector.markForCheck();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.errorMessage = 'Unable to load categories.';
        this.changeDetector.markForCheck();
        this.isLoading = false;
      },
    });
  }

  get filteredCategories(): Category[] {
    const search = this.searchText.toLowerCase().trim();

    return this.loadedCategories.filter((category) => {
      const haystack =
        (category.name || '') + ' ' + (category.description || '');
      const matchesSearch = search === '' || haystack.toLowerCase().includes(search);
      const matchesCategory =
        this.selectedCategory === 'All' || category.name === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  /** Every link points at the single category page, which takes the id. */
  categoryRoute(category: Category): string[] {
    return ['/category', category._id];
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'All';
  }
}
