import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { HEADER_CONFIG, HeaderLink } from './header.config';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  private readonly http = inject(HttpClient);
  protected readonly config = HEADER_CONFIG;
  protected isScrolled = false;
  public isLoggedIn = false;
  public userRole = 'student';
  public userFullName = 'Your account';
  public profileImage = '';
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
    let userId = '';
    this.userFullName = 'Your account';
    this.profileImage = '';
    if (token) {
      try {
        const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')));
        nextRole = String(payload.role || '').toLowerCase();
        userId = String(payload.userId || '');
        if (!userId || !['student', 'instructor', 'admin'].includes(nextRole)) throw new Error('Invalid token claims');
        if (payload.fullname) {
          this.userFullName = this.formatDisplayName(String(payload.fullname));
        } else if (payload.firstName) {
          this.userFullName = this.formatDisplayName(`${payload.firstName} ${payload.lastName || ''}`.trim());
        }
      } catch {
        localStorage.removeItem('token');
        this.isLoggedIn = false;
        nextRole = 'student';
      }
    }
    this.userRole = nextRole;

    if (token && this.isLoggedIn && ['student', 'instructor'].includes(nextRole)) {
      this.http.get<any>('http://localhost:3000/E-learning/users/myProfile', {
        headers: { Authorization: token },
      }).subscribe({
        next: (response) => {
          // Ignore late profile responses if a different account has logged in meanwhile.
          if (localStorage.getItem('token') !== token) return;
          const user = response?.data ?? response;
          const actualName = [user?.firstName, user?.lastName].filter((part) => typeof part === 'string' && part.trim()).join(' ').trim();
          if (actualName) this.userFullName = this.formatDisplayName(actualName);
          this.profileImage = typeof user?.img === 'string' ? user.img : '';
        },
        error: () => {
          // The name parsed from the signed-in token remains the fallback if the profile API is temporarily unavailable.
        },
      });
    }
    else if (token && this.isLoggedIn && nextRole === 'admin') {
      this.http.get<any>(`http://localhost:3000/E-learning/admins/profile/${encodeURIComponent(userId)}`, {
        headers: { Authorization: token },
      }).subscribe({
        next: (response) => {
          if (localStorage.getItem('token') !== token) return;
          const user = response?.data ?? response;
          const actualName = [user?.firstName, user?.lastName].filter((part) => typeof part === 'string' && part.trim()).join(' ').trim();
          if (actualName) this.userFullName = this.formatDisplayName(actualName);
          this.profileImage = typeof user?.img === 'string' ? user.img : '';
        },
        error: () => {},
      });
    }

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
    this.userFullName = 'Your account';
    this.profileImage = '';
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

  private formatDisplayName(name: string): string {
    return name.trim().toLocaleLowerCase().replace(/(^|[\s'-])\p{L}/gu, (letter) => letter.toLocaleUpperCase());
  }

  get userInitials(): string {
    return this.userFullName
      .split(' ')
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U';
  }

  @HostListener('window:pathwayed-profile-updated')
  onProfileUpdated(): void {
    this.checkAuth();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 12;
  }
}
