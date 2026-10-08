import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';

export type CatalogSubcategory = {
  name: string;
  slug: string;
};

export type CatalogCategory = {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description: string;
  image: string;
  badge: string;
  status: string;
  subcategories: CatalogSubcategory[];
  trackCount: number;
  courseCount: number;
};

export type CatalogCategoryRef = Pick<
  CatalogCategory,
  '_id' | 'name' | 'slug'
>;

export type CatalogTrack = {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  description: string;
  courseCount?: number;
  categoryId: CatalogCategoryRef | string;
};

export type CatalogCourse = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  level: string;
  duration: number;
  rating: number;
  track?: CatalogTrack | string;
};

export type CatalogPopularTrack = {
  category: string;
  badge: string;
  text: string;
  courses: number;
  route: string;
};

export type CatalogPageData = {
  categories: CatalogCategory[];
  category: CatalogCategory | null;
  tracks: CatalogTrack[];
  popularTracks: CatalogPopularTrack[];
};

export type CatalogTrackPageData = {
  category: CatalogCategory;
  track: CatalogTrack;
  courses: CatalogCourse[];
};

const categoryVisuals: Record<
  string,
  { image: string; badge: string; icon: string }
> = {
  'web-development': {
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=675&q=90',
    badge: 'Technology & Engineering',
    icon: '▣',
  },
  languages: {
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&h=675&q=90',
    badge: 'Global Fluency',
    icon: '文',
  },
  'ui-ux-design': {
    image:
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&h=675&q=90',
    badge: 'Creative & Product',
    icon: '◉',
  },
  business: {
    image:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&h=675&q=90',
    badge: 'Leadership & Growth',
    icon: '⌁',
  },
};

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly apiUrl = 'http://localhost:3000/E-learning';

  constructor(private readonly http: HttpClient) {}

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/category`);
  }

  getCategoryBySlug(slug: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/category/catogrybyslugs/${encodeURIComponent(slug)}`
    );
  }

  getTracksByCategory(categoryId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/track/category/${encodeURIComponent(categoryId)}`
    );
  }

  getTracks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/track`);
  }

  getTrackBySlug(slug: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/track/trackBySlug/${encodeURIComponent(slug)}`
    );
  }

  getCoursesByTrack(trackId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/course/track/${encodeURIComponent(trackId)}`
    );
  }

  getCoursesByCategory(categoryId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/course/category/${encodeURIComponent(categoryId)}`
    );
  }

  getAllCourses(limit = 50): Observable<any> {
    return this.http.get(`${this.apiUrl}/course`, {
      params: { limit },
    });
  }

  getCatalogPage(): Observable<CatalogPageData> {
    return forkJoin({
      categories: this.getCategories(),
      tracks: this.getTracks(),
    }).pipe(
      map(({ categories, tracks }) => ({
        categories: (categories.categories ?? []).map((category: any) =>
          this.toCategory(category)
        ),
        category: null,
        tracks: [],
        popularTracks: (tracks.tracks ?? [])
          .slice(0, 3)
          .map((track: CatalogTrack) => {
            const category =
              typeof track.categoryId === 'string'
                ? null
                : track.categoryId;

            return {
              category: track.title,
              badge: category?.name ?? 'Learning track',
              text: track.description,
              courses: track.courseCount ?? 0,
              route: category
                ? `/catalog/${category.slug}/${track.slug}`
                : '/catalog',
            };
          }),
      }))
    );
  }

  getCategoryPage(categorySlug: string): Observable<CatalogPageData> {
    return this.getCategoryBySlug(categorySlug).pipe(
      switchMap((response) => {
        const category = this.toCategory(response.category);

        return this.getTracksByCategory(category._id).pipe(
          map((tracksResponse) => ({
            categories: [],
            category,
            tracks: tracksResponse.tracks ?? [],
            popularTracks: [],
          }))
        );
      })
    );
  }

  getTrackPage(
    categorySlug: string,
    trackSlug: string
  ): Observable<CatalogTrackPageData> {
    return forkJoin({
      categoryResponse: this.getCategoryBySlug(categorySlug),
      trackResponse: this.getTrackBySlug(trackSlug),
    }).pipe(
      switchMap(({ categoryResponse, trackResponse }) => {
        const category = this.toCategory(categoryResponse.category);
        const track: CatalogTrack = trackResponse.track;

        return this.getCoursesByCategory(category._id).pipe(
          map((response) => ({
            category,
            track,
            courses: (response.data ?? []).filter(
              (course: CatalogCourse) => {
                const courseTrackId =
                  typeof course.track === 'string'
                    ? course.track
                    : course.track?._id;

                return courseTrackId === track._id;
              }
            ),
          }))
        );
      })
    );
  }

  private toCategory(raw: any): CatalogCategory {
    const visual = categoryVisuals[raw.slug] ?? {
      image:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&h=675&q=90',
      badge: 'Learning Category',
      icon: raw.icon || '◇',
    };

    const subcategories = (raw.subcategories ?? []).map((item: any) =>
      typeof item === 'string'
        ? {
            name: item,
            slug: item.toLowerCase().replace(/\s+/g, '-'),
          }
        : item
    );

    return {
      ...raw,
      icon: raw.icon || visual.icon,
      image: raw.image || visual.image,
      badge: visual.badge,
      status: `${raw.trackCount ?? 0} tracks`,
      subcategories,
      trackCount: raw.trackCount ?? 0,
      courseCount: raw.courseCount ?? 0,
    };
  }
}