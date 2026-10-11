import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Courses } from '../../components/courses/courses';
import { InstructorService } from '../../services/instructor.service';
import { Category, Track } from '../../mock-types';

@Component({
  selector: 'app-all-courses',
  standalone: true,
  imports: [RouterLink, FormsModule, Courses],
  templateUrl: './all-courses.html',
  styleUrl: './all-courses.css',
})
export class AllCoursesPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly backend = inject(InstructorService);
  // Zoneless app: async callbacks must schedule change detection themselves.
  private readonly changeDetector = inject(ChangeDetectorRef);

  /** Free-text search coming from `?q=`. */
  query = '';
  searchText = '';

  /** Set when the search matched a category, which narrows the track list. */
  matchedCategory: Category | null = null;

  categories: Category[] = [];
  tracks: Track[] = [];

  loading = true;

  ngOnInit() {
    // ?q= can change while the page is open, so subscribe to it.
    this.route.queryParams.subscribe((params) => {
      this.query = params['q'] ?? '';
      this.searchText = this.query;
      this.applyQuery();
      this.changeDetector.detectChanges();
    });

    this.backend.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.applyQuery();
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.loading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  /**
   * `?q=` may be a category name (coming from the landing page cards) or a
   * free-text course search. When it matches a category we also load that
   * category's tracks.
   */
  private applyQuery(): void {
    this.tracks = [];
    this.matchedCategory = null;

    const search = this.query.trim().toLowerCase();
    if (!search) {
      this.loading = false;
      return;
    }

    const match = this.categories.find(
      (c) => c.name?.toLowerCase() === search
    );

    if (!match) {
      this.loading = false;
      return;
    }

    this.matchedCategory = match;
    this.backend.getTracksByCategory(match._id).subscribe({
      next: (tracks) => {
        this.tracks = tracks;
        this.loading = false;
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching tracks:', err);
        this.loading = false;
        this.changeDetector.detectChanges();
      },
    });
  }

  /** Reads `?q=` and re-runs the lookup whenever it changes. */
  bindQuery(params: Record<string, string>): void {
    this.query = params['q'] ?? '';
    this.applyQuery();
  }

  get trackRoute(): string[] {
    return this.matchedCategory
      ? ['/category', this.matchedCategory._id]
      : ['/courses'];
  }
}
