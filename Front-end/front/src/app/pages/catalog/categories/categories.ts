import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoryService, Category as ApiCategory } from '../../../services/category';

type Category = {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image: string;
  badge: string;
  status: string;
  subcategoriesCount: number;
  subcategories: string[];
  courses: number;
  enrolled: string;
  price: number;
  route: string;
};

const routeCategoryMap: Record<string, string> = {
  languages: 'Languages',
  'ui-ux-design': 'UI/UX Design',
  business: 'Business',
  'web-development': 'Web Development',
};

const categoryRouteMap: Record<string, string> = {
  'Web Development': '/catalog/web-development',
  Languages: '/catalog/languages',
  'UI/UX Design': '/catalog/ui-ux-design',
  Business: '/catalog/business',
};

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  searchText = '';
  selectedCategory = 'All';
  selectedSort = 'Most Popular';

  categories: Category[] = [];

  loading = false;
  errorMessage = '';

  readonly careerGoals = [
    {
      icon: '◉',
      title: 'Build a Career',
      text: 'Transition to a new role with job readiness and practical portfolio skills.',
      recommendation: 'Web Development',
    },
    {
      icon: 'ϟ',
      title: 'Learn a New Skill',
      text: 'Build specialized skills in modern tools, technologies and frameworks.',
      recommendation: 'Figma, Python',
    },
    {
      icon: '▣',
      title: 'Improve Your Language',
      text: 'Improve communication, speaking and professional language skills.',
      recommendation: 'Business English',
    },
    {
      icon: '✦',
      title: 'Start a New Field',
      text: 'Cross-disciplinary career transitions with practical learning.',
      recommendation: 'Product Management',
    },
  ];

  readonly popularTracks = [
    {
      category: 'UI/UX & Design Systems',
      badge: '+34% this week',
      text: 'High-enterprise demand for Figma, micro-interactions and modern product workflows.',
      courses: 65,
      learners: '28,000+',
      route: '/catalog/ui-ux-design',
    },
    {
      category: 'Business English for Global Work',
      badge: 'Top rated 4.9/5',
      text: 'Build confident professional English for global communication and remote work.',
      courses: 32,
      learners: '16,200+',
      route: '/catalog/business',
    },
    {
      category: 'Full-Stack Web Development',
      badge: '12,000 active learners',
      text: 'Complete full-stack path with modern frontend, backend and cloud deployment.',
      courses: 54,
      learners: '12,000+',
      route: '/catalog/web-development/full-stack',
    },
  ];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly categoryService: CategoryService,
  ) {}

  ngOnInit(): void {
    const segment = this.activatedRoute.snapshot.url.at(-1)?.path ?? '';

    this.selectedCategory = routeCategoryMap[segment] ?? 'All';

    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.errorMessage = '';

    this.categoryService.getCategories().subscribe({
      next: (response: { categories: any[]; }) => {
        this.categories = response.categories.map((category: { _id: any; name: any; slug: any; icon: any; description: any; image: any; badge: any; status: any; subcategoriesCount: any; subcategories: any[]; courses: any; }) => {
          return {
            _id: category._id,
            name: category.name,
            slug: category.slug,
            icon: category.icon ?? '▣',
            description: category.description,
            image: category.image ?? '',
            badge: category.badge ?? '',
            status: category.status ?? '',
            subcategoriesCount: category.subcategoriesCount ?? category.subcategories.length,
            subcategories: category.subcategories.map((subcategory: { name: any; }) => subcategory.name),
            courses: category.courses ?? 0,
            enrolled: '0',
            price: 0,
            route: `/catalog/${category.slug}`,
          };
        });

        this.loading = false;
      },

      error: (error: any) => {
        console.error(error);

        this.errorMessage = 'Failed to load categories. Please try again.';

        this.loading = false;
      },
    });
  }

  get categoriesList(): string[] {
    return this.categories.map((category) => category.name);
  }

  categoryRoute(category: string): string {
    const foundCategory = this.categories.find((item) => item.name === category);

    if (foundCategory) {
      return `/catalog/${foundCategory.slug}`;
    }

    return categoryRouteMap[category] ?? '/catalog';
  }

  get filteredCategories(): Category[] {
    const search = this.searchText.toLowerCase().trim();

    let result = this.categories.filter((category) => {
      const searchableText = [
        category.name,
        category.description,
        category.badge,
        category.courses.toString(),
        category.enrolled,
        category.price.toString(),
        ...category.subcategories,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = search === '' || searchableText.includes(search);

      const matchesCategory =
        this.selectedCategory === 'All' ||
        category.name.toLowerCase() === this.selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    switch (this.selectedSort) {
      case 'Most Popular':
        result = [...result].sort((a, b) => b.courses - a.courses);
        break;

      case 'A-Z':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;

      case 'Z-A':
        result = [...result].sort((a, b) => b.name.localeCompare(a.name));
        break;

      case 'Price: Low to High':
        result = [...result].sort((a, b) => a.price - b.price);
        break;

      case 'Price: High to Low':
        result = [...result].sort((a, b) => b.price - a.price);
        break;

      default:
        break;
    }

    return result;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'All';
    this.selectedSort = 'Most Popular';
  }
}
