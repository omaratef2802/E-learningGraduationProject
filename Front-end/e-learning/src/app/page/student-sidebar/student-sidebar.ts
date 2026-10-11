import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { STUDENT_SIDEBAR_CONFIG } from './student-sidebar.config';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-sidebar.html',
  styleUrl: './student-sidebar.css',
})
export class StudentSidebar {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  protected readonly config = STUDENT_SIDEBAR_CONFIG;
  protected readonly cartCount = this.cartService.itemCount;
  protected menuOpen = false;

  private readonly firstName: string;
  protected readonly profileName: string;

  constructor() {
    let fullName = 'Student';
    try {
      const token = localStorage.getItem('token');
      const encoded = token?.split('.')[1];
      if (encoded) {
        const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
        const bytes = Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
        const payload = JSON.parse(new TextDecoder().decode(bytes));
        fullName = payload.fullname || fullName;
      }
    } catch {
      // Keep the friendly default when the token cannot be read.
    }
    this.profileName = fullName;
    this.firstName = fullName.trim().split(/\s+/)[0] || 'Student';
  }

  get profileInitial(): string {
    return this.firstName.charAt(0).toUpperCase();
  }

  isActive(route: string): boolean {
    const current = this.router.url.split('?')[0];
    return current === route;
  }

  navigate(route: string): void {
    this.menuOpen = false;
    this.router.navigate([route]);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
