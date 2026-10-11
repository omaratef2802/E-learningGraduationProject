import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import { InstructorService } from '../../services/instructor.service';
import { InstructorDataService } from '../../services/instructor-data.service';

@Component({
  selector: 'app-instructor-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, InstructorSidebar],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class InstructorCatalog implements OnInit {
  private readonly instructorService = inject(InstructorService);
  private readonly router = inject(Router);
  private readonly instructorData = inject(InstructorDataService);

  public data: any = { instructor: {}, courses: [] };
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.instructorData.getProfile().subscribe({
      next: (profile) => this.data.instructor = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        image: profile.img || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        role: profile.role || 'Instructor',
      },
      error: () => {},
    });
    this.instructorService.getMyCourses().subscribe({
      next: (response: any) => {
        const courses = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
        this.data.courses = courses.map((course: any) => ({
          id: course._id,
          title: course.title || course.name || 'Untitled course',
          category: course.category?.name || course.track?.title || 'Uncategorized',
          status: course.status || 'draft',
          image: course.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
          students: course.enrolledStudents?.length || 0,
          rating: course.rating ?? '—',
          updated: course.updatedAt ? new Date(course.updatedAt).toLocaleDateString() : 'Recently updated',
          price: `$${Number(course.price || 0).toFixed(2)}`,
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Unable to load instructor catalog:', error);
        this.errorMessage = error.error?.message || 'Unable to load your courses right now.';
        this.loading = false;
      },
    });
  }

  openCourse(courseId: string, courseTitle: string): void {
    this.router.navigate(['/instructor-course-curriculum'], {
      queryParams: { course: courseTitle, courseId },
    });
  }
}
