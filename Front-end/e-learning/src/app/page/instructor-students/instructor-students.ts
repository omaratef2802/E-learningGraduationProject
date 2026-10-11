import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { InstructorDataService } from '../../services/instructor-data.service';
import { InstructorSidebar } from '../instructor-sidebar/sidebar';

@Component({
  selector: 'app-instructor-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InstructorSidebar],
  templateUrl: './instructor-students.html',
  styleUrl: './instructor-students.css',
})
export class InstructorStudents implements OnInit {
  private readonly dataService = inject(InstructorDataService);

  students: any[] = [];
  filteredStudents: any[] = [];
  search = '';
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.dataService.getMyStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Unable to load students enrolled in your courses.';
        this.loading = false;
      },
    });
  }

  applyFilter(): void {
    const query = this.search.trim().toLowerCase();
    this.filteredStudents = this.students.filter((student) =>
      !query || `${student.firstName} ${student.lastName} ${student.email} ${student.courses.map((course: any) => course.courseTitle).join(' ')}`.toLowerCase().includes(query),
    );
  }

  getCourseSummary(student: any): string {
    const count = student.courses?.length || 0;
    return `${count} ${count === 1 ? 'course' : 'courses'}`;
  }

  getCourseNames(student: any): string {
    return (student.courses || []).map((course: any) => course.courseTitle).join(' · ');
  }

  getOverallProgress(student: any): number {
    const courses = student.courses || [];
    if (!courses.length) return 0;
    return Math.round(courses.reduce((sum: number, course: any) => sum + Number(course.progress || 0), 0) / courses.length);
  }

  initials(student: any): string {
    return `${student.firstName?.trim()?.[0] || ''}${student.lastName?.trim()?.[0] || ''}`.toUpperCase() || 'S';
  }
}
