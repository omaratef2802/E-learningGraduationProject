import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Course, CourseService } from '../../services/course';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'app-instructor-dashboard',
  imports: [CommonModule],
  templateUrl: './instructor-dashboard.html',
  styleUrl: './instructor-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructorDashboardComponent implements OnInit {
  activeNav = signal<string>('dashboard');

  searchQuery = signal<string>('');

  showCreateModal = signal<boolean>(false);

  selectedCourse = signal<Course | null>(null);

  loading = signal<boolean>(false);

  errorMessage = signal<string>('');

  successMessage = signal<string>('');

  navItems = signal<NavItem[]>([
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fa-solid fa-table-cells-large',
    },
    {
      id: 'courses',
      label: 'My Courses',
      icon: 'fa-solid fa-book',
    },
    {
      id: 'create',
      label: 'Create Course',
      icon: 'fa-solid fa-plus',
    },
    {
      id: 'students',
      label: 'Students',
      icon: 'fa-solid fa-users',
    },
    {
      id: 'assessments',
      label: 'Assessments',
      icon: 'fa-solid fa-square-check',
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: 'fa-solid fa-certificate',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'fa-regular fa-bell',
      badge: '3',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'fa-regular fa-user',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'fa-solid fa-gear',
    },
  ]);

  courses = signal<Course[]>([]);

  filteredCourses = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return this.courses();
    }

    return this.courses().filter((course) => {
      const title = course.title?.toLowerCase() || '';

      const description = course.description?.toLowerCase() || '';

      const slug = course.slug?.toLowerCase() || '';

      const level = course.level?.toLowerCase() || '';

      return (
        title.includes(query) ||
        description.includes(query) ||
        slug.includes(query) ||
        level.includes(query)
      );
    });
  });

  totalCourses = computed(() => {
    return this.courses().length;
  });

  totalStudents = computed(() => {
    return 0;
  });

  publishedCourses = computed(() => {
    return this.courses().filter((course) => course.status === 'published').length;
  });

  draftCourses = computed(() => {
    return this.courses().filter((course) => course.status === 'draft').length;
  });

  totalReviews = computed(() => {
    return 0;
  });

  averageRating = computed(() => {
    const courses = this.courses();

    if (courses.length === 0) {
      return '0.0';
    }

    const ratedCourses = courses.filter((course) => course.rating > 0);

    if (ratedCourses.length === 0) {
      return '0.0';
    }

    const totalRating = ratedCourses.reduce((total, course) => total + course.rating, 0);

    return (totalRating / ratedCourses.length).toFixed(1);
  });

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading.set(true);

    this.errorMessage.set('');

    this.courseService.getCourses().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.courses.set(response.data);
        } else {
          this.errorMessage.set(response.message || 'Failed to load courses');
        }

        this.loading.set(false);
      },

      error: (error: any) => {
        console.error(error);

        this.errorMessage.set(error.error?.message || 'Failed to connect to the server');

        this.loading.set(false);
      },
    });
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchQuery.set(input.value);
  }

  changeNav(id: string): void {
    this.activeNav.set(id);

    if (id === 'create') {
      this.showCreateModal.set(true);
    }
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);

    this.errorMessage.set('');
  }

  addNewCourse(
    title: string,
    tag: string,
    description: string,
    price: string,
    level: string,
    category: string,
    track: string,
  ): void {
    if (!title.trim()) {
      this.errorMessage.set('Course title is required');

      return;
    }

    if (!description.trim()) {
      this.errorMessage.set('Course description is required');

      return;
    }

    if (!price) {
      this.errorMessage.set('Course price is required');

      return;
    }

    if (!category) {
      this.errorMessage.set('Category is required');

      return;
    }

    if (!track) {
      this.errorMessage.set('Track is required');

      return;
    }

    const cleanTitle = title.trim();

    const slug = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const newCourse = {
      title: cleanTitle,

      description: description.trim(),

      slug: slug,

      image:
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600',

      category: category,

      track: track,

      price: Number(price),

      level: level || 'beginner',

      rating: 0,

      status: 'published',

      objectives: [],

      prerequisites: [],
    };

    this.loading.set(true);

    this.errorMessage.set('');

    this.courseService.createCourse(newCourse).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.courses.update((currentCourses) => [response.data, ...currentCourses]);

          this.showCreateModal.set(false);

          this.activeNav.set('courses');

          this.successMessage.set('Course created successfully');

          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);
        } else {
          this.errorMessage.set(response.message || 'Failed to create course');
        }

        this.loading.set(false);
      },

      error: (error: any) => {
        console.error(error);

        this.errorMessage.set(error.error?.message || 'Failed to create course');

        this.loading.set(false);
      },
    });
  }

  openManageModal(course: Course): void {
    this.selectedCourse.set(course);
  }

  closeManageModal(): void {
    this.selectedCourse.set(null);
  }

  toggleCourseStatus(course: Course): void {
    let newStatus: 'draft' | 'published';

    if (course.status === 'published') {
      newStatus = 'draft';
    } else {
      newStatus = 'published';
    }

    this.loading.set(true);

    this.errorMessage.set('');

    this.courseService
      .updateCourse(course._id, {
        status: newStatus,
      })
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.courses.update((currentCourses) => {
              return currentCourses.map((item) => {
                if (item._id === course._id) {
                  return response.data;
                }

                return item;
              });
            });

            this.successMessage.set(
              `Course ${newStatus === 'published' ? 'published' : 'moved to draft'} successfully`,
            );

            setTimeout(() => {
              this.successMessage.set('');
            }, 3000);
          } else {
            this.errorMessage.set(response.message || 'Failed to update course');
          }

          this.loading.set(false);

          this.selectedCourse.set(null);
        },

        error: (error: any) => {
          console.error(error);

          this.errorMessage.set(error.error?.message || 'Failed to update course');

          this.loading.set(false);

          this.selectedCourse.set(null);
        },
      });
  }

  deleteCourse(course: Course): void {
    const confirmed = confirm(`Are you sure you want to delete "${course.title}"?`);

    if (!confirmed) {
      return;
    }

    this.loading.set(true);

    this.errorMessage.set('');

    this.courseService.deleteCourse(course._id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.courses.update((currentCourses) =>
            currentCourses.filter((item) => item._id !== course._id),
          );

          this.successMessage.set('Course deleted successfully');

          setTimeout(() => {
            this.successMessage.set('');
          }, 3000);
        } else {
          this.errorMessage.set(response.message || 'Failed to delete course');
        }

        this.loading.set(false);

        this.selectedCourse.set(null);
      },

      error: (error: any) => {
        console.error(error);

        this.errorMessage.set(error.error?.message || 'Failed to delete course');

        this.loading.set(false);

        this.selectedCourse.set(null);
      },
    });
  }
}
