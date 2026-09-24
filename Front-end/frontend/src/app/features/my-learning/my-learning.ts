import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideBookOpen,
  lucideChevronLeft,
  lucideChevronRight
} from '@ng-icons/lucide';
import { CourseCardComponent } from '../dashboard/components/course-card/course-card';
import { CourseItem } from '../dashboard/dashboard.model';

export type FilterTab = 'all' | 'in-progress' | 'completed' | 'not-started';

@Component({
  selector: 'app-my-learning',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIcon,
    CourseCardComponent
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideBookOpen,
      lucideChevronLeft,
      lucideChevronRight
    })
  ],
  templateUrl: './my-learning.html',
  styleUrl: './my-learning.css'
})
export class MyLearningComponent {
  // Search & Filter state
  readonly searchQuery = signal('');
  readonly activeTab = signal<FilterTab>('all');

  // Pagination state (6 items per page)
  readonly pageSize = signal(6);
  readonly currentPage = signal(1);

  // Course Data matching reference image + multiple items for pagination
  readonly allCourses = signal<CourseItem[]>([
    {
      id: 'ml-1',
      title: 'React Fundamentals & Modern...',
      instructor: 'Ahmed Hassan',
      lastActive: 'Completed on Jun 12',
      tag: 'Foundations',
      tagClass: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/60',
      status: 'completed',
      statusText: 'Completed',
      completedLessons: 18,
      totalLessons: 18,
      progressPercent: 100,
      progressGradient: 'gradient-green',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ml-2',
      title: 'Full-Stack Web Development',
      instructor: 'Sara Mohamed',
      lastActive: 'Last active 3 days ago',
      tag: 'FULL STACK',
      tagClass: 'bg-blue-50/90 text-blue-700 border-blue-200/60',
      status: 'in-progress',
      statusText: 'In Progress',
      completedLessons: 11,
      totalLessons: 38,
      progressPercent: 28,
      progressGradient: 'gradient-blue',
      buttonText: 'Continue Learning',
      imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ml-3',
      title: 'Full-Stack Web Development',
      instructor: 'Sara Mohamed',
      lastActive: 'Last active 3 days ago',
      tag: 'FULL STACK',
      tagClass: 'bg-blue-50/90 text-blue-700 border-blue-200/60',
      status: 'in-progress',
      statusText: 'In Progress',
      completedLessons: 11,
      totalLessons: 38,
      progressPercent: 28,
      progressGradient: 'gradient-blue',
      buttonText: 'Continue Learning',
      imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ml-4',
      title: 'Full-Stack Web Development',
      instructor: 'Sara Mohamed',
      lastActive: 'Last active 3 days ago',
      tag: 'FULL STACK',
      tagClass: 'bg-blue-50/90 text-blue-700 border-blue-200/60',
      status: 'in-progress',
      statusText: 'In Progress',
      completedLessons: 11,
      totalLessons: 38,
      progressPercent: 28,
      progressGradient: 'gradient-blue',
      buttonText: 'Continue Learning',
      imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ml-5',
      title: 'React Fundamentals & Modern...',
      instructor: 'Ahmed Hassan',
      lastActive: 'Completed on May 28',
      tag: 'Foundations',
      tagClass: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/60',
      status: 'completed',
      statusText: 'Completed',
      completedLessons: 18,
      totalLessons: 18,
      progressPercent: 100,
      progressGradient: 'gradient-green',
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ml-6',
      title: 'Python for Data Science & AI',
      instructor: 'Jose Portilla',
      lastActive: 'Not started yet',
      tag: 'DATA SCIENCE',
      tagClass: 'bg-purple-50/90 text-purple-700 border-purple-200/60',
      status: 'not-started',
      statusText: 'Not Started',
      completedLessons: 0,
      totalLessons: 24,
      progressPercent: 0,
      progressGradient: 'gradient-blue',
      buttonText: 'Start Learning',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ml-7',
      title: 'UI/UX Design Masterclass',
      instructor: 'Daniel Walter Scott',
      lastActive: 'Not started yet',
      tag: 'DESIGN',
      tagClass: 'bg-amber-50/90 text-amber-700 border-amber-200/60',
      status: 'not-started',
      statusText: 'Not Started',
      completedLessons: 0,
      totalLessons: 32,
      progressPercent: 0,
      progressGradient: 'gradient-blue',
      buttonText: 'Start Learning',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'ml-8',
      title: 'Advanced TypeScript Patterns',
      instructor: 'Stephen Grider',
      lastActive: 'Completed on Apr 15',
      tag: 'FRONTEND',
      tagClass: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/60',
      status: 'completed',
      statusText: 'Completed',
      completedLessons: 22,
      totalLessons: 22,
      progressPercent: 100,
      progressGradient: 'gradient-green',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80'
    }
  ]);

  // Dynamic counts for tabs
  readonly totalCount = computed(() => this.allCourses().length);
  readonly inProgressCount = computed(() => this.allCourses().filter(c => c.status === 'in-progress').length);
  readonly completedCount = computed(() => this.allCourses().filter(c => c.status === 'completed').length);
  readonly notStartedCount = computed(() => this.allCourses().filter(c => c.status === 'not-started').length);

  // Filtered courses based on search & active tab
  readonly filteredCourses = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const tab = this.activeTab();

    return this.allCourses().filter(course => {
      // Tab filter
      if (tab !== 'all' && course.status !== tab) {
        return false;
      }

      // Search filter
      if (query) {
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesInstructor = course.instructor.toLowerCase().includes(query);
        const matchesTag = course.tag.toLowerCase().includes(query);
        return matchesTitle || matchesInstructor || matchesTag;
      }

      return true;
    });
  });

  // Total pages
  readonly totalPages = computed(() => {
    const total = this.filteredCourses().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  // Current page items
  readonly paginatedCourses = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredCourses().slice(start, start + this.pageSize());
  });

  // Array of page numbers
  readonly pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  // Pagination display range text
  readonly paginationRangeText = computed(() => {
    const total = this.filteredCourses().length;
    if (total === 0) return '0 courses';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), total);
    return `Showing ${start}-${end} of ${total} courses`;
  });

  setTab(tab: FilterTab): void {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  onContinueCourse(course: CourseItem): void {
    console.log('Continuing course:', course.title);
  }

  onViewCourse(course: CourseItem): void {
    console.log('Viewing course:', course.title);
  }

  onViewCertificate(course: CourseItem): void {
    console.log('Opening certificate for:', course.title);
  }
}
