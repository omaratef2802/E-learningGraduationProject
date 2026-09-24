import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

type Category = {
  name: string;
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
export class Categories {
  searchText = '';
  selectedCategory = 'All';
  selectedSort = 'Most Popular';

  readonly categoriesList = ['Web Development', 'Languages', 'UI/UX Design', 'Business'];

  readonly categories: Category[] = [
    {
      name: 'Web Development',
      icon: '▣',
      description:
        'Build practical skills for creating modern websites, high-performance web applications and digital products.',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=675&q=90',
      badge: 'Technology & Engineering',
      status: 'Updated weekly',
      subcategoriesCount: 5,
      subcategories: ['Frontend', 'Backend', 'Full-Stack'],
      courses: 120,
      enrolled: '42,000+',
      price: 99,
      route: '/catalog/web-development',
    },
    {
      name: 'Languages',
      icon: '文',
      description:
        'Develop your linguistic and international communication skills for academic, career and personal growth.',
      image:
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&h=675&q=90',
      badge: 'Global Fluency',
      status: 'CEFR Certified',
      subcategoriesCount: 4,
      subcategories: ['Business English', 'Spanish', 'German & French'],
      courses: 80,
      enrolled: '31,500+',
      price: 79,
      route: '/catalog/languages',
    },
    {
      name: 'UI/UX Design',
      icon: '◉',
      description:
        'Learn how to create intuitive, accessible interfaces and craft meaningful digital products.',
      image:
        'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&h=675&q=90',
      badge: 'Creative & Product',
      status: 'Top trending',
      subcategoriesCount: 4,
      subcategories: ['Figma', 'Prototyping', 'UX Research'],
      courses: 68,
      enrolled: '28,000+',
      price: 89,
      route: '/catalog/ui-ux-design',
    },
    {
      name: 'Business',
      icon: '⌁',
      description:
        'Develop actionable business, go-to-market and people management skills for future leadership.',
      image:
        'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&h=675&q=90',
      badge: 'Leadership & Growth',
      status: 'Executive Approved',
      subcategoriesCount: 4,
      subcategories: ['Executive Leadership', 'Growth Marketing', 'Financial Analysis'],
      courses: 70,
      enrolled: '24,000+',
      price: 109,
      route: '/catalog/business',
    },
  ];

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

  constructor(private readonly activatedRoute: ActivatedRoute) {
    const segment = this.activatedRoute.snapshot.url.at(-1)?.path ?? '';
    this.selectedCategory = routeCategoryMap[segment] ?? 'All';
  }

  categoryRoute(category: string): string {
    return categoryRouteMap[category] ?? '/catalog';
  }

  get filteredCategories() {
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