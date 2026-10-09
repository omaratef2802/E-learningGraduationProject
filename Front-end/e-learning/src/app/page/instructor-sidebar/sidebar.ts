import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { INSTRUCTOR_SIDEBAR_CONFIG } from './sidebar.config';

@Component({
  selector: 'app-instructor-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class InstructorSidebar {

  private readonly router = inject(Router);

  protected readonly config = INSTRUCTOR_SIDEBAR_CONFIG;

  protected firstName = 'Instructor';
  protected lastName = '';

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.fullname) {
          const parts = payload.fullname.split(' ');
          this.firstName = parts[0] || 'Instructor';
          this.lastName = parts.slice(1).join(' ') || '';
        }
      } catch (e) {
        console.error('Error decoding token', e);
      }
    }
  }

  protected menuOpen = false;

  isActive(route: string): boolean {
    const current =
      this.router.url.split('?')[0];

    return current === route;
  }

  navigate(route: string): void {
    this.menuOpen = false;

    this.router.navigate([route]);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  get profileName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get profileInitial(): string {
    return this.firstName
      .charAt(0)
      .toUpperCase();
  }
}