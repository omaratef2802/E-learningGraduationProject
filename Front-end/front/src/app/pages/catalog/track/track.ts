import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-track',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './track.html',
  styleUrl: './track.css'
})
export class Track implements OnInit {

  searchText = '';
  selectedLevel = 'All';
  selectedCategory = 'All';
  selectedSort = 'Most Popular';

  currentTrack = {
    label: 'TECHNOLOGY & ENGINEERING',
    title: 'Web Development',
    description:
      'Build practical skills in modern web technologies and learn how to create professional websites and web applications.'
  };

  private readonly trackMap: Record<string, { label: string; title: string; description: string }> = {
    'web-development': {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Web Development',
      description: 'Build practical skills in modern web technologies and learn how to create professional websites and web applications.'
    },
    programming: {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Programming Fundamentals',
      description: 'Master core programming concepts, logic, and problem solving with a strong foundation.'
    },
    'front-end': {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Front-End Development',
      description: 'Learn how to architect responsive, interactive, and modern interfaces with current web standards.'
    },
    'back-end': {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Back-End Development',
      description: 'Learn APIs, databases, security, and server-side systems for real-world applications.'
    },
    'full-stack': {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Full-Stack Development',
      description: 'Build complete products by combining frontend, backend, and deployment workflows.'
    },
    mobile: {
      label: 'TECHNOLOGY & ENGINEERING',
      title: 'Mobile App Development',
      description: 'Design and build modern mobile experiences for iOS and Android users.'
    }
  };

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.url.subscribe(() => {
      this.syncTrackFromRoute();
    });
  }

  courses = [
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
      route: '/catalog/web-development/programming'
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
      route: '/catalog/web-development/front-end'
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
      route: '/catalog/web-development/back-end'
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
      route: '/catalog/web-development/full-stack'
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
      route: '/catalog/web-development/mobile'
    }
  ];

  get filteredCourses() {

    const search = this.searchText
      .toLowerCase()
      .trim();

    const currentRouteKey = this.getCurrentRouteKey();

    let result = this.courses.filter(course => {
      const searchableText = [
        course.title,
        course.category,
        course.level,
        course.description,
        course.lessons.toString(),
        course.students,
        course.rating.toString(),
        course.price.toString()
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        search === '' ||
        searchableText.includes(search);

      const courseRouteKey = this.getCourseRouteKey(course.route);
      const matchesTrack =
        currentRouteKey !== 'web-development'
          ? courseRouteKey === currentRouteKey
          : this.selectedCategory === 'All' || courseRouteKey === this.selectedCategory;

      const matchesLevel =
        this.selectedLevel === 'All' ||
        course.level === this.selectedLevel;

      return matchesSearch && matchesTrack && matchesLevel;
    });

    if (this.selectedSort === 'Most Popular') {
      result = [...result].sort(
        (a, b) => b.rating - a.rating
      );
    }

    if (this.selectedSort === 'A-Z') {
      result = [...result].sort(
        (a, b) => a.title.localeCompare(b.title)
      );
    }

    if (this.selectedSort === 'Price: Low to High') {
      result = [...result].sort(
        (a, b) => a.price - b.price
      );
    }

    if (this.selectedSort === 'Price: High to Low') {
      result = [...result].sort(
        (a, b) => b.price - a.price
      );
    }

    return result;
  }

  setLevel(level: string) {
    this.selectedLevel = level;
  }

  setCategory(category: string) {
    this.selectedCategory = category;
  }

  clearFilters() {
    this.resetTrackState();
  }

  private syncTrackFromRoute() {
    const segment = this.activatedRoute.snapshot.url.at(-1)?.path ?? 'front-end';
    const routeKey = this.getRouteKey(segment);
    const meta = this.trackMap[routeKey] ?? this.trackMap['front-end'];
    this.currentTrack = meta;
  }

  private getCurrentRouteKey() {
    const segment = this.activatedRoute.snapshot.url.at(-1)?.path ?? 'front-end';
    return this.getRouteKey(segment);
  }

  private getRouteKey(route: string) {
    if (route === 'web-development') return 'web-development';
    if (route === 'programming') return 'programming';
    if (route === 'front-end') return 'front-end';
    if (route === 'back-end') return 'back-end';
    if (route === 'full-stack') return 'full-stack';
    if (route === 'mobile') return 'mobile';
    return 'front-end';
  }

  private getCourseRouteKey(courseRoute: string) {
    if (courseRoute.includes('programming')) return 'programming';
    if (courseRoute.includes('front-end')) return 'front-end';
    if (courseRoute.includes('back-end')) return 'back-end';
    if (courseRoute.includes('full-stack')) return 'full-stack';
    if (courseRoute.includes('mobile')) return 'mobile';
    return 'front-end';
  }

  private resetTrackState() {
    this.searchText = '';
    this.selectedCategory = 'All';
    this.selectedLevel = 'All';
    this.selectedSort = 'Most Popular';
  }
}