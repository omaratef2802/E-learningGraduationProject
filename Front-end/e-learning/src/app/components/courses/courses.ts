import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { COURSES_CONFIG } from './courses.config';

@Component({
  selector: 'app-courses',
  standalone: true,
  templateUrl: './courses.html',
  styleUrl: './courses.css',
})
export class Courses {
  private readonly router = inject(Router);
  protected readonly config = COURSES_CONFIG;

  openCourse(query: string): void {
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }
}
