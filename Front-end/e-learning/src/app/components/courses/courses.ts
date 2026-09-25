import { Component, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { COURSES_CONFIG, CourseItem } from './courses.config';
import { InstructorData } from '../../page/instructor-data';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  private readonly router = inject(Router);
  protected readonly data = inject(InstructorData);
  protected readonly config = COURSES_CONFIG;
  
  @Input() limit?: number;

  get coursesList(): CourseItem[] {
    let list: CourseItem[] = this.config.items;
    const rawCourses = this.data.courses;
    if (rawCourses && rawCourses.length > 0) {
      list = rawCourses.map((c) => ({
        image: c.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85',
        tag: c.category || c.track || 'Web Dev',
        rating: c.rating && c.rating !== '—' ? c.rating : '4.9',
        reviews: c.students ? `${c.students} students` : '1,200',
        title: c.title,
        instructor: c.instructorName || `${this.data.instructor.firstName} ${this.data.instructor.lastName}`.trim() || 'Lead Instructor',
        level: c.level || 'All Levels',
        duration: c.duration || '36h',
        price: c.price || '$49.99',
        query: c.title
      }));
    }
    
    if (this.limit && this.limit > 0) {
      return list.slice(0, this.limit);
    }
    return list;
  }

  openCourse(query: string): void {
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }
}
