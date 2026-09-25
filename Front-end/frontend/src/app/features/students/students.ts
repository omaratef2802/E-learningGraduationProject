import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideChevronDown,
  lucideChevronLeft,
  lucideChevronRight
} from '@ng-icons/lucide';
import { StudentDrawerComponent } from './components/student-drawer/student-drawer';
import { StudentItem } from './students.model';
import { InstructorService } from '../../core/services/instructor.service';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon, StudentDrawerComponent],
  providers: [
    provideIcons({
      lucideSearch,
      lucideChevronDown,
      lucideChevronLeft,
      lucideChevronRight
    })
  ],
  templateUrl: './students.html',
  styleUrl: './students.css'
})
export class StudentsComponent implements OnInit {
  private readonly instructorService = inject(InstructorService);

  // Search and filter signals
  readonly searchQuery = signal('');
  readonly selectedCourse = signal('All Courses');
  readonly selectedStatus = signal('All Status');

  // Drawer state
  readonly isDrawerOpen = signal(false);
  readonly selectedStudent = signal<StudentItem | null>(null);

  // Pagination state
  readonly pageSize = signal(8);
  readonly currentPage = signal(1);

  // Student Data loaded from backend API
  readonly students = signal<StudentItem[]>([]);

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.instructorService.getInstructorStudents().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.students.set(response.data);
        } else {
          this.students.set([]);
        }
      },
      error: (err) => {
        console.error('Failed to load instructor students:', err);
        this.students.set([]);
      }
    });
  }

  // Dynamic filter options
  readonly availableCourses = computed(() => [
    'All Courses',
    ...new Set(this.students().map(s => s.courseTitle))
  ]);

  readonly availableStatuses = computed(() => [
    'All Status',
    ...new Set(this.students().map(s => s.status))
  ]);

  // Filtered students list
  readonly filteredStudents = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const course = this.selectedCourse();
    const status = this.selectedStatus();

    return this.students().filter(s => {
      // Course filter
      if (course !== 'All Courses' && s.courseTitle !== course) {
        return false;
      }

      // Status filter
      if (status !== 'All Status' && s.status !== status) {
        return false;
      }

      // Search query
      if (query) {
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesEmail = s.email.toLowerCase().includes(query);
        const matchesCourse = s.courseTitle.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesCourse;
      }

      return true;
    });
  });

  // Total pages
  readonly totalPages = computed(() => {
    const total = this.filteredStudents().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  // Paginated students slice
  readonly paginatedStudents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredStudents().slice(start, start + this.pageSize());
  });

  // Pagination display text
  readonly paginationText = computed(() => {
    const total = this.filteredStudents().length;
    if (total === 0) return 'Showing 0 to 0 of 0 students';
    const start = (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), total);
    return `Showing ${start} to ${end} of ${total} students`;
  });

  // Open details drawer
  viewStudent(student: StudentItem): void {
    this.selectedStudent.set(student);
    this.isDrawerOpen.set(true);
  }

  // Close details drawer
  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  onSendMessage(student: StudentItem): void {
    console.log('Sending message to student:', student.name, student.email);
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
}
