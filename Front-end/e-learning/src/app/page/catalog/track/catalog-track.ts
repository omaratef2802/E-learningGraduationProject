import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { CourseActions } from '../../../components/course-actions/course-actions';
import {
  CatalogCategoryRef,
  CatalogCourse,
  CatalogService,
  CatalogTrack as CatalogTrackModel,
} from '../../../services/catalog.service';

type Category = CatalogCategoryRef;
type Track = CatalogTrackModel;
type Course = CatalogCourse;
type TrackPageState = {
  category: Category | null;
  track: Track | null;
  courses: Course[];
  error: string;
};

@Component({
  selector: 'app-catalog-track',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe, DecimalPipe, CourseActions],
  templateUrl: './catalog-track.html',
  styleUrl: './track.css',
})
export class CatalogTrack implements OnInit {
  searchText = '';
  selectedSort = 'Most Popular';
  category: Category | null = null;
  track: Track | null = null;
  courses: Course[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly catalog: CatalogService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const categorySlug = params.get('categorySlug');
          const trackSlug = params.get('trackSlug');
          this.loading = true;
          this.error = '';
          this.searchText = '';

          if (!categorySlug || !trackSlug) {
            return of(this.failedState('Choose a category and track to view courses.'));
          }

          return this.catalog.getTrackPage(categorySlug, trackSlug).pipe(
            catchError(() => of(this.offlineState(categorySlug, trackSlug))),
          );
        }),
      )
      .subscribe((state) => {
        this.category = state.category;
        this.track = state.track;
        this.courses = state.courses;
        this.error = 'error' in state ? state.error : '';
        this.loading = false;
        this.changeDetector.markForCheck();
      });
  }

  get filteredCourses(): Course[] {
    const search = this.searchText.trim().toLowerCase();
    const filtered = this.courses.filter((course) =>
      `${course.title} ${course.description} ${course.level}`.toLowerCase().includes(search),
    );

    switch (this.selectedSort) {
      case 'A-Z':
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      case 'Price: Low to High':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'Price: High to Low':
        return [...filtered].sort((a, b) => b.price - a.price);
      default:
        return [...filtered].sort((a, b) => b.rating - a.rating);
    }
  }

  displayLevel(level: string): string {
    return level.charAt(0).toUpperCase() + level.slice(1);
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedSort = 'Most Popular';
  }

  private failedState(error: string): TrackPageState {
    return { category: null, track: null, courses: [], error };
  }

  private offlineState(categorySlug: string, trackSlug: string): TrackPageState {
    const category: Category = {
      _id: '',
      name: this.displaySlug(categorySlug),
      slug: categorySlug,
    };
    const track: Track = {
      _id: '',
      title: this.displaySlug(trackSlug),
      slug: trackSlug,
      description: '',
      categoryId: category,
    };
    return {
      category,
      track,
      courses: [],
      error: 'Backend is offline. The course list will load when the server is available.',
    };
  }

  private displaySlug(slug: string): string {
    const knownNames: Record<string, string> = {
      'web-development': 'Web Development',
      'ui-ux-design': 'UI/UX Design',
      'front-end': 'Front-End Development',
      'back-end': 'Back-End Development',
      'full-stack': 'Full-Stack Development',
      'html-css': 'HTML & CSS',
    };
    return knownNames[slug] ?? slug.split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ');
  }
}