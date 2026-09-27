import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ADMIN_SIDEBAR_CONFIG } from './admin-sidebar.config';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css',
})
export class AdminSidebar {

  private readonly router = inject(Router);

  protected readonly config = ADMIN_SIDEBAR_CONFIG;

  protected readonly firstName =
    localStorage.getItem('adminFirstName') || 'Naema';

  protected readonly lastName =
    localStorage.getItem('adminLastName') || 'Sayed';

  protected menuOpen = false;


  // ==================================================
  // CHECK ACTIVE ROUTE
  // ==================================================

  isActive(route: string): boolean {

    const current =
      this.router.url.split('?')[0];

    return current === route;

  }


  // ==================================================
  // NAVIGATE
  // ==================================================

  navigate(route: string): void {

    this.menuOpen = false;

    this.router.navigate([
      route
    ]);

  }


  // ==================================================
  // OPEN PROFILE
  // ==================================================

  openProfile(): void {

    this.menuOpen = false;

    this.router.navigate([
      '/admin-profile'
    ]);

  }


  // ==================================================
  // MOBILE MENU
  // ==================================================

  toggleMenu(): void {

    this.menuOpen = !this.menuOpen;

  }


  // ==================================================
  // PROFILE NAME
  // ==================================================

  get profileName(): string {

    return `${this.firstName} ${this.lastName}`;

  }


  // ==================================================
  // PROFILE INITIAL
  // ==================================================

  get profileInitial(): string {

    return this.firstName
      .charAt(0)
      .toUpperCase();

  }

}