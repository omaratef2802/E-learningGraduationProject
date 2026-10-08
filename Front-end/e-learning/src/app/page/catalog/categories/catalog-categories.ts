import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import {
  CatalogCategory,
  CatalogPageData,
  CatalogPopularTrack,
  CatalogService,
  CatalogTrack,
} from '../../../services/catalog.service';

type Category = CatalogCategory;
type Track = CatalogTrack;
type PopularTrack = CatalogPopularTrack;
type CategoriesPageState = CatalogPageData & { error: string };

const fallbackCategoryVisuals: Record<string, { image: string; badge: string; icon: string }> = {
  'web-development': {
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=675&q=90',
    badge: 'Technology & Engineering',
    icon: '▣',
  },
  languages: {
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&h=675&q=90',
    badge: 'Global Fluency',
    icon: '文',
  },
  'ui-ux-design': {
    image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&h=675&q=90',
    badge: 'Creative & Product',
    icon: '◉',
  },
  business: {
    image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&h=675&q=90',
    badge: 'Leadership & Growth',
    icon: '⌁',
  },
};

const fallbackCategories: Category[] = [
  {
    _id: 'fallback-web-development', name: 'Web Development', slug: 'web-development', icon: '▣',
    description: 'Build practical skills for creating modern websites, high-performance web applications and digital products.',
    image: fallbackCategoryVisuals['web-development'].image, badge: fallbackCategoryVisuals['web-development'].badge,
    status: 'Updated weekly', trackCount: 5, courseCount: 120,
    subcategories: [{ name: 'Frontend', slug: 'front-end' }, { name: 'Backend', slug: 'back-end' }, { name: 'Full-Stack', slug: 'full-stack' }],
  },
  {
    _id: 'fallback-languages', name: 'Languages', slug: 'languages', icon: '文',
    description: 'Develop your linguistic and international communication skills for academic, career and personal growth.',
    image: fallbackCategoryVisuals['languages'].image, badge: fallbackCategoryVisuals['languages'].badge,
    status: 'CEFR Certified', trackCount: 4, courseCount: 80,
    subcategories: [{ name: 'Business English', slug: 'business-english' }, { name: 'Spanish', slug: 'spanish' }, { name: 'German & French', slug: 'german-french' }],
  },
  {
    _id: 'fallback-ui-ux-design', name: 'UI/UX Design', slug: 'ui-ux-design', icon: '◉',
    description: 'Learn how to create intuitive, accessible interfaces and craft meaningful digital products.',
    image: fallbackCategoryVisuals['ui-ux-design'].image, badge: fallbackCategoryVisuals['ui-ux-design'].badge,
    status: 'Top trending', trackCount: 4, courseCount: 68,
    subcategories: [{ name: 'Figma', slug: 'figma' }, { name: 'Prototyping', slug: 'prototyping' }, { name: 'UX Research', slug: 'ux-research' }],
  },
  {
    _id: 'fallback-business', name: 'Business', slug: 'business', icon: '⌁',
    description: 'Develop actionable business, go-to-market and people management skills for future leadership.',
    image: fallbackCategoryVisuals['business'].image, badge: fallbackCategoryVisuals['business'].badge,
    status: 'Executive Approved', trackCount: 4, courseCount: 70,
    subcategories: [{ name: 'Executive Leadership', slug: 'executive-leadership' }, { name: 'Growth Marketing', slug: 'growth-marketing' }, { name: 'Financial Analysis', slug: 'financial-analysis' }],
  },
];

@Component({
  selector: 'app-catalog-categories',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './catalog-categories.html',
  styleUrl: './categories.css',
})
export class CatalogCategories implements OnInit {
  searchText = '';
  categories: Category[] = [];
  activeCategory: Category | null = null;
  tracks: Track[] = [];
  popularTracks: PopularTrack[] = [];
  loading = true;
  error = '';

  readonly careerGoals = [
    { icon: '◉', title: 'Build a Career', text: 'Transition to a new role with job readiness and practical portfolio skills.', recommendation: 'Web Development' },
    { icon: 'ϟ', title: 'Learn a New Skill', text: 'Build specialized skills in modern tools, technologies and frameworks.', recommendation: 'Figma, Python' },
    { icon: '▣', title: 'Improve Your Language', text: 'Improve communication, speaking and professional language skills.', recommendation: 'Business English' },
    { icon: '✦', title: 'Start a New Field', text: 'Cross-disciplinary career transitions with practical learning.', recommendation: 'Product Management' },
  ];

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
          this.loading = true;
          this.error = '';
          this.searchText = '';

          const request = categorySlug
            ? this.catalog.getCategoryPage(categorySlug)
            : this.catalog.getCatalogPage();

          return request.pipe(
            catchError(() => of(categorySlug
              ? this.offlineCategoryState(categorySlug)
              : {
                  categories: fallbackCategories,
                  category: null,
                  tracks: [],
                  popularTracks: [],
                  error: 'Could not connect to the server. Showing saved categories for now.',
                })),
          );
        }),
      )
      .subscribe((state) => {
        this.categories = state.categories;
        this.activeCategory = state.category;
        this.tracks = state.tracks;
        this.popularTracks = state.popularTracks;
        this.error = 'error' in state ? state.error : '';
        this.loading = false;
        this.changeDetector.markForCheck();
      });
  }

  get categoriesList(): string[] {
    return this.categories.map((category) => category.name);
  }

  get selectedCategory(): string {
    return this.activeCategory?.name ?? 'All';
  }

  get totalCourses(): number {
    return this.categories.reduce((total, category) => total + category.courseCount, 0);
  }

  get filteredCategories(): Category[] {
    const search = this.searchText.trim().toLowerCase();
    return this.categories.filter((category) =>
      `${category.name} ${category.description} ${category.badge} ${category.subcategories.map((item) => item.name).join(' ')}`
        .toLowerCase()
        .includes(search),
    );
  }

  get filteredTracks(): Track[] {
    const search = this.searchText.trim().toLowerCase();
    return this.tracks.filter((track) => `${track.title} ${track.description}`.toLowerCase().includes(search));
  }

  categoryRoute(name: string): string {
    const category = this.categories.find((item) => item.name === name);
    return category ? `/catalog/${category.slug}` : '/catalog';
  }

  clearFilters(): void {
    this.searchText = '';
  }

  private offlineCategoryState(categorySlug: string): CategoriesPageState {
    const category = fallbackCategories.find((item) => item.slug === categorySlug) ?? null;
    const tracks = category?.subcategories.map((subcategory, index): Track => ({
      _id: `${category.slug}-${index}`,
      title: subcategory.name,
      slug: subcategory.slug,
      description: category.description,
      categoryId: category,
    })) ?? [];
    return {
      categories: [],
      category,
      tracks,
      popularTracks: [],
      error: category
        ? 'Backend is offline. Showing saved tracks; live courses need the backend connection.'
        : 'This category could not be loaded. Check the backend connection.',
    };
  }
}