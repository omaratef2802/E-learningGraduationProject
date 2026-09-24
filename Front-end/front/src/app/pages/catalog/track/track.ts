import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

type TrackRouteKey =
  | 'web-development'
  | 'programming'
  | 'front-end'
  | 'back-end'
  | 'full-stack'
  | 'mobile'
  | 'html-css'
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'vue'
  | 'angular';

type TrackMeta = {
  label: string;
  title: string;
  description: string;
};

type TrackCourse = {
  title: string;
  category: string;
  level: string;
  displayLevel: string;
  icon: string;
  lessons: number;
  students: string;
  rating: number;
  price: number;
  image: string;
  description: string;
  route: string;
};

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './track.html',
  styleUrl: './track.css',
})
export class Track implements OnInit {
  searchText = '';
  selectedLevel = 'All';
  selectedCategory = 'All';
  selectedSort = 'Most Popular';

  currentTrack: TrackMeta = {
    label: 'TECHNOLOGY & ENGINEERING',
    title: 'Web Development',
    description:
      'Build practical skills in modern web technologies and learn how to create professional websites and web applications.',
  };

  private readonly defaultRouteKey: TrackRouteKey = 'front-end';

  private readonly trackMap: Record<TrackRouteKey, TrackMeta> = {
    'web-development': {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Web Development',
      description:
        'Build practical skills in modern web technologies and learn how to create professional websites and web applications.',
    },

    programming: {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Programming Fundamentals',
      description:
        'Master core programming concepts, logic, and problem solving with a strong foundation.',
    },

    'front-end': {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Front-End Development',
      description:
        'Learn how to architect responsive, interactive, and modern interfaces with current web standards.',
    },

    'back-end': {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Back-End Development',
      description:
        'Learn APIs, databases, security, and server-side systems for real-world applications.',
    },

    'full-stack': {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Full-Stack Development',
      description:
        'Build complete products by combining frontend, backend, and deployment workflows.',
    },

    mobile: {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Mobile App Development',
      description:
        'Design and build modern mobile experiences for iOS and Android users.',
    },

    'html-css': {
      label: 'FRONT-END DEVELOPMENT',
      title: 'HTML5 & Modern CSS3',
      description:
        'Master semantic markup, responsive Flexbox and Grid layouts, modern CSS architecture, and accessible web interfaces.',
    },

    javascript: {
      label: 'FRONT-END DEVELOPMENT',
      title: 'JavaScript Mastery',
      description:
        'Deep dive into modern ES6+, asynchronous JavaScript, DOM manipulation, closures, event-driven architecture, and APIs.',
    },

    typescript: {
      label: 'FRONT-END DEVELOPMENT',
      title: 'TypeScript for Enterprise',
      description:
        'Write scalable, type-safe frontend code using interfaces, generics, type narrowing, and advanced compiler configurations.',
    },

    react: {
      label: 'FRONT-END DEVELOPMENT',
      title: 'React Development',
      description:
        'Master React, modern hooks, component architecture, state management, and performance patterns for production applications.',
    },

    vue: {
      label: 'FRONT-END DEVELOPMENT',
      title: 'Vue.js 3 Ecosystem',
      description:
        'Build fast, reactive web applications with Vue 3, Composition API, Pinia state store, Vue Router, and Vue tooling.',
    },

    angular: {
      label: 'FRONT-END DEVELOPMENT',
      title: 'Angular Enterprise Architecture',
      description:
        'Architect robust enterprise applications with Angular components, dependency injection, RxJS reactive streams, and NgRx.',
    },
  };

  readonly webDevelopmentCourses: TrackCourse[] = [
    {
      title: 'Programming Fundamentals',
      category: 'Core Foundations',
      level: 'Beginner',
      displayLevel: 'Lv. 1–3',
      icon: '◇',
      lessons: 8,
      students: '35 Courses',
      rating: 4.9,
      price: 35,
      image:
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Master foundational algorithms, data structures, and computer science problem-solving principles.',
      route: '/catalog/web-development/programming',
    },

    {
      title: 'Front-End Development',
      category: 'Interactive UI',
      level: 'Beginner',
      displayLevel: 'Lv. 1–4',
      icon: '◉',
      lessons: 6,
      students: '45 Courses',
      rating: 4.8,
      price: 45,
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Learn how to architect modern, responsive, and high-performance interactive user interfaces with modern web standards.',
      route: '/catalog/web-development/front-end/tracks',
    },

    {
      title: 'Back-End Development',
      category: 'Server & Cloud',
      level: 'Intermediate',
      displayLevel: 'Lv. 2–5',
      icon: '▤',
      lessons: 5,
      students: '40 Courses',
      rating: 4.7,
      price: 89,
      image:
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Learn APIs, databases, authentication and server-side development.',
      route: '/catalog/web-development/back-end',
    },

    {
      title: 'Full-Stack Development',
      category: 'Complete Systems',
      level: 'Intermediate',
      displayLevel: 'Lv. 2–5',
      icon: '{}',
      lessons: 5,
      students: '35 Courses',
      rating: 4.6,
      price: 119,
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Master both frontend and backend technologies and build complete web applications.',
      route: '/catalog/web-development/full-stack',
    },

    {
      title: 'Mobile App Development',
      category: 'iOS & Android',
      level: 'Intermediate',
      displayLevel: 'Lv. 1–4',
      icon: '▯',
      lessons: 4,
      students: '30 Courses',
      rating: 4.5,
      price: 99,
      image:
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Learn how to design and develop modern mobile applications.',
      route: '/catalog/web-development/mobile',
    },
  ];

  readonly frontEndTracks: TrackCourse[] = [
    {
      title: 'HTML5 & Modern CSS3',
      category: 'HTML/CSS',
      level: 'Beginner',
      displayLevel: 'Lv. 1–3',
      icon: '◇',
      lessons: 8,
      students: '7 Courses',
      rating: 4.8,
      price: 35,
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Master semantic markup, responsive Flexbox and Grid layouts, modern CSS architecture, and accessible web interfaces.',
      route: '/catalog/web-development/front-end/html-css',
    },

    {
      title: 'JavaScript Mastery',
      category: 'JavaScript',
      level: 'Beginner',
      displayLevel: 'Lv. 1–4',
      icon: 'JS',
      lessons: 10,
      students: '10 Courses',
      rating: 4.9,
      price: 49,
      image:
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Deep dive into modern ES6+, asynchronous JavaScript, DOM manipulation, closures, event-driven architecture, and APIs.',
      route: '/catalog/web-development/front-end/javascript',
    },

    {
      title: 'TypeScript for Enterprise',
      category: 'TypeScript',
      level: 'Intermediate',
      displayLevel: 'Lv. 2–5',
      icon: 'TS',
      lessons: 8,
      students: '6 Courses',
      rating: 4.9,
      price: 55,
      image:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Write scalable, type-safe frontend applications using interfaces, generics, type narrowing, and advanced TypeScript patterns.',
      route: '/catalog/web-development/front-end/typescript',
    },

    {
      title: 'React Development',
      category: 'React',
      level: 'Beginner',
      displayLevel: 'Lv. 1–5',
      icon: 'R',
      lessons: 12,
      students: '12 Courses',
      rating: 4.9,
      price: 69,
      image:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Master React, modern hooks, component architecture, state management, and performance patterns for production applications.',
      route: '/catalog/web-development/front-end/react',
    },

    {
      title: 'Vue.js 3 Ecosystem',
      category: 'Vue.js',
      level: 'Intermediate',
      displayLevel: 'Lv. 2–4',
      icon: 'V',
      lessons: 8,
      students: '8 Courses',
      rating: 4.8,
      price: 59,
      image:
        'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Build fast, reactive web applications with Vue 3, Composition API, Pinia state store, Vue Router, and Vue tooling.',
      route: '/catalog/web-development/front-end/vue',
    },

    {
      title: 'Angular Enterprise Architecture',
      category: 'Angular',
      level: 'Advanced',
      displayLevel: 'Lv. 3–5',
      icon: 'A',
      lessons: 9,
      students: '9 Courses',
      rating: 4.7,
      price: 69,
      image:
        'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&h=700&q=90',
      description:
        'Architect robust enterprise applications with Angular components, dependency injection, RxJS reactive streams, and NgRx.',
      route: '/catalog/web-development/front-end/angular',
    },
  ];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.activatedRoute.url.subscribe(() => {
      this.syncTrackFromRoute();
    });
  }

  get filteredCourses(): TrackCourse[] {
    const routeKey = this.getCurrentRouteKey();

    const sourceCourses =
      routeKey === 'front-end' ||
      routeKey === 'html-css' ||
      routeKey === 'javascript' ||
      routeKey === 'typescript' ||
      routeKey === 'react' ||
      routeKey === 'vue' ||
      routeKey === 'angular'
        ? this.frontEndTracks
        : this.webDevelopmentCourses;

    const search = this.searchText
      .toLowerCase()
      .trim();

    let result = sourceCourses.filter((course) => {
      const searchableText = [
        course.title,
        course.category,
        course.level,
        course.description,
        course.lessons.toString(),
        course.students,
        course.rating.toString(),
        course.price.toString(),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        search === '' ||
        searchableText.includes(search);

      const matchesCategory =
        this.selectedCategory === 'All' ||
        this.getCourseRouteKey(course.route) ===
          this.selectedCategory;

      const matchesLevel =
        this.selectedLevel === 'All' ||
        course.level === this.selectedLevel;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel
      );
    });

    result = this.sortCourses(result);

    return result;
  }

  setLevel(level: string): void {
    this.selectedLevel = level;
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'All';
    this.selectedLevel = 'All';
    this.selectedSort = 'Most Popular';
  }

  private sortCourses(
    courses: TrackCourse[],
  ): TrackCourse[] {
    switch (this.selectedSort) {
      case 'Most Popular':
        return [...courses].sort(
          (a, b) => b.rating - a.rating,
        );

      case 'A-Z':
        return [...courses].sort((a, b) =>
          a.title.localeCompare(b.title),
        );

      case 'Price: Low to High':
        return [...courses].sort(
          (a, b) => a.price - b.price,
        );

      case 'Price: High to Low':
        return [...courses].sort(
          (a, b) => b.price - a.price,
        );

      default:
        return courses;
    }
  }

  private syncTrackFromRoute(): void {
    const routeKey = this.getCurrentRouteKey();

    this.currentTrack =
      this.trackMap[routeKey] ??
      this.trackMap[this.defaultRouteKey];
    if (routeKey === 'web-development') {
      this.selectedCategory = 'All';
      this.searchText = '';
      this.selectedLevel = 'All';
      this.selectedSort = 'Most Popular';
      return;
    }
    if (routeKey === 'front-end') {
      this.selectedCategory = 'All';
      this.searchText = '';
      this.selectedLevel = 'All';
      this.selectedSort = 'Most Popular';
      return;
    }
    if (
      routeKey === 'html-css' ||
      routeKey === 'javascript' ||
      routeKey === 'typescript' ||
      routeKey === 'react' ||
      routeKey === 'vue' ||
      routeKey === 'angular'
    ) {
      this.selectedCategory = routeKey;
      this.searchText = '';
      this.selectedLevel = 'All';
      this.selectedSort = 'Most Popular';
      return;
    }

    this.selectedCategory = routeKey;
  }

  private getCurrentRouteKey(): TrackRouteKey {
    const urlSegments =
      this.activatedRoute.snapshot.url;

    const lastSegment =
      urlSegments.length > 0
        ? urlSegments[urlSegments.length - 1].path
        : this.defaultRouteKey;

    return this.getRouteKey(lastSegment);
  }

  private getRouteKey(
    route: string,
  ): TrackRouteKey {
    if (route === 'web-development') {
      return 'web-development';
    }

    if (route === 'programming') {
      return 'programming';
    }

    if (route === 'front-end') {
      return 'front-end';
    }

    if (route === 'back-end') {
      return 'back-end';
    }

    if (route === 'full-stack') {
      return 'full-stack';
    }

    if (route === 'mobile') {
      return 'mobile';
    }

    if (route === 'html-css') {
      return 'html-css';
    }

    if (route === 'javascript') {
      return 'javascript';
    }

    if (route === 'typescript') {
      return 'typescript';
    }

    if (route === 'react') {
      return 'react';
    }

    if (route === 'vue') {
      return 'vue';
    }

    if (route === 'angular') {
      return 'angular';
    }

    return this.defaultRouteKey;
  }

  private getCourseRouteKey(
    courseRoute: string,
  ): TrackRouteKey {
    if (courseRoute.includes('/programming')) {
      return 'programming';
    }

    if (courseRoute.includes('/front-end/tracks')) {
      return 'front-end';
    }

    if (courseRoute.includes('/html-css')) {
      return 'html-css';
    }

    if (courseRoute.includes('/javascript')) {
      return 'javascript';
    }

    if (courseRoute.includes('/typescript')) {
      return 'typescript';
    }

    if (courseRoute.includes('/react')) {
      return 'react';
    }

    if (courseRoute.includes('/vue')) {
      return 'vue';
    }

    if (courseRoute.includes('/angular')) {
      return 'angular';
    }

    if (courseRoute.includes('/back-end')) {
      return 'back-end';
    }

    if (courseRoute.includes('/full-stack')) {
      return 'full-stack';
    }

    if (courseRoute.includes('/mobile')) {
      return 'mobile';
    }

    return 'front-end';
  }
}
    
