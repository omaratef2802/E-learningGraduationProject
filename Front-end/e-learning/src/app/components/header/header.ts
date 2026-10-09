import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { HEADER_CONFIG, HeaderLink } from './header.config';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  protected readonly config = HEADER_CONFIG;
  protected isScrolled = false;
  public isLoggedIn = false;
  public userRole = 'student';
  public userFullName = 'User';
  public dropdownOpen = false;
  protected readonly cartCount = this.cartService.itemCount;
  private routerSubscription?: Subscription;
  private lastCartToken: string | null = null;

  ngOnInit() {
    this.checkAuth();
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.checkAuth());
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  checkAuth() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    let nextRole = 'student';
    this.userFullName = 'User';
    if (token) {
      try {
        const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')));
        nextRole = String(payload.role || '').toLowerCase();
        if (!payload.userId || !['student', 'instructor', 'admin'].includes(nextRole)) throw new Error('Invalid token claims');
        if (payload.fullname) {
          this.userFullName = payload.fullname;
        } else if (payload.firstName) {
          this.userFullName = `${payload.firstName} ${payload.lastName || ''}`.trim();
        }
      } catch {
        localStorage.removeItem('token');
        this.isLoggedIn = false;
        nextRole = 'student';
      }
    }
    this.userRole = nextRole;

    if (token !== this.lastCartToken) {
      this.lastCartToken = token;
      if (this.isLoggedIn && nextRole === 'student') {
        this.cartService.getCart().subscribe({ error: () => this.cartService.clearState() });
      } else {
        this.cartService.clearState();
      }
    }
  }

  getDashboardRoute(): string {
    if (this.userRole === 'instructor') return '/instructor-dashboard';
    if (this.userRole === 'admin') return '/admin-dashboard';
    return '/student-dashboard';
  }

  getProfileRoute(): string {
    if (this.userRole === 'instructor') return '/instructor-profile';
    if (this.userRole === 'admin') return '/admin-profile';
    return '/profile';
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.dropdownOpen = false;
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.userRole = 'student';
    this.userFullName = 'User';
    this.dropdownOpen = false;
    this.lastCartToken = null;
    this.cartService.clearState();
    this.router.navigate(['/']);
  }

  isLinkActive(link: HeaderLink): boolean {
    const currentUrl = this.router.url.split('?')[0].split('#')[0];
    if (link.label === 'Home') {
      return currentUrl === '/' || currentUrl === '' || currentUrl === '/index.html';
    }
    // A category page is part of the catalog, so the "Categories" entry stays
    // highlighted while browsing one.
    if (link.route === '/categories') {
      return currentUrl === '/categories' || currentUrl.startsWith('/category/');
    }
    return currentUrl === link.route;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 12;
  }
}
