import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { InstructorService } from '../../../services/instructor.service';
import { Category, Track } from '../../../mock-types';

@Component({
  selector: 'app-front-end-tracks',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './front-end-tracks.html',
  styleUrl: './front-end-tracks.css',
})
export class FrontEndTracks implements OnInit {
  private readonly backend = inject(InstructorService);
  private readonly route = inject(ActivatedRoute);
  // No zone.js in this app: async callbacks must schedule change detection
  // themselves, otherwise the tracks and courses never reach the screen.
  private readonly changeDetector = inject(ChangeDetectorRef);

  /** The category the URL points at, resolved from its id. */
  public categoryId = '';
  public category: Category | null = null;

  /** Tracks belonging to this category. */
  public loadedTracks: Track[] = [];

  public searchText = '';
  public loading = true;
  public errorMessage = '';

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('categoryId') || '';

    if (!this.categoryId) {
      this.loading = false;
      this.errorMessage = 'No category was selected.';
      return;
    }

    this.loadCategory();
  }

  private loadCategory(): void {
    this.loading = true;
    this.errorMessage = '';

    this.backend.getCategories().subscribe({
      next: (categories) => {
        this.category = categories.find((c) => c._id === this.categoryId) ?? null;

        if (!this.category) {
          this.errorMessage = 'That category could not be found.';
          this.loading = false;
          this.changeDetector.markForCheck();
          return;
        }

        this.loadTracks();
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
        this.errorMessage = 'Unable to load this category.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  private loadTracks(): void {
    // The service unwraps the response, so both calls hand back plain arrays.
    this.backend.getTracksByCategory(this.categoryId).subscribe({
      next: (tracks) => {
        this.loadedTracks = tracks;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching tracks:', err);
        this.loadedTracks = [];
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });

  }

  get filteredTracks(): Track[] {
    const search = this.searchText.trim().toLowerCase();
    if (!search) return this.loadedTracks;

    return this.loadedTracks.filter(
      (track) =>
        track.title?.toLowerCase().includes(search) ||
        track.description?.toLowerCase().includes(search)
    );
  }

  get skillCount(): number {
    return this.loadedTracks.reduce(
      (total, track) => total + (track.requiredSkills?.length || 0),
      0
    );
  }

  clearFilters(): void {
    this.searchText = '';
  }
}
