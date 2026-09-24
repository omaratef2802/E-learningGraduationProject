import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutGrid,
  lucideBookOpen,
  lucideCheckSquare,
  lucideBadgeCheck,
  lucideBell,
  lucideBookmark,
  lucideSettings,
  lucideLogOut
} from '@ng-icons/lucide';
import { NavItem, UserProfile } from '../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [
    provideIcons({
      lucideLayoutGrid,
      lucideBookOpen,
      lucideCheckSquare,
      lucideBadgeCheck,
      lucideBell,
      lucideBookmark,
      lucideSettings,
      lucideLogOut
    })
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard', route: '/dashboard', icon: 'lucideLayoutGrid' },
    { label: 'My Courses', route: '/courses', icon: 'lucideBookOpen' },
    { label: 'Assessments', route: '/assessments', icon: 'lucideCheckSquare' },
    { label: 'Certificates', route: '/certificates', icon: 'lucideBadgeCheck' },
    { label: 'Notifications', route: '/notifications', icon: 'lucideBell' },
    { label: 'Wishlist', route: '/wishlist', icon: 'lucideBookmark' },
    { label: 'Settings', route: '/settings', icon: 'lucideSettings' }
  ]);

  readonly currentUser = signal<UserProfile>({
    id: 'usr-1',
    name: 'Naema Chen',
    role: 'Student Workspace',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    status: 'online'
  });

  onLogout(): void {
    console.log('Logging out user:', this.currentUser().name);
  }
}
