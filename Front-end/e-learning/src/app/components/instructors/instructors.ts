import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { INSTRUCTORS_CONFIG } from './instructors.config';

@Component({
  selector: 'app-instructors',
  standalone: true,
  templateUrl: './instructors.html',
  styleUrl: './instructors.css',
})
export class Instructors {
  protected readonly config = INSTRUCTORS_CONFIG;

  constructor(private readonly router: Router) {}

  viewInstructor(name: string): void {
    this.router.navigate(['/search'], { queryParams: { instructor: name } });
  }
}
