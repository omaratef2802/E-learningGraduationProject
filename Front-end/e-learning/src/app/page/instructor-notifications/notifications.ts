import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import { InstructorDataService } from '../../services/instructor-data.service';

@Component({
  selector: 'app-instructor-notifications',
  standalone: true,
  imports: [CommonModule, InstructorSidebar],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class InstructorNotifications implements OnInit {
  private readonly router = inject(Router);
  private readonly dataService = inject(InstructorDataService);

  public data: any = { instructor: { firstName: '', lastName: '', image: '', role: 'Instructor' } };
  notifications: any[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.dataService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Unable to load notifications right now.';
        this.loading = false;
      },
    });
    this.dataService.getProfile().subscribe({
      next: (profile) => {
        this.data.instructor = {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          image: profile.img || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
          role: profile.role || 'Instructor',
        };
      },
      error: () => {},
    });
  }

  markAsRead(notification: any): void {
    if (notification.isRead) return;
    this.dataService.updateNotification(notification.id, { isRead: true }).subscribe({
      next: () => notification.isRead = true,
      error: (error) => this.errorMessage = error.error?.message || 'Could not update this notification.',
    });
  }

  removeNotification(id: string): void {
    this.dataService.deleteNotification(id).subscribe({
      next: () => this.notifications = this.notifications.filter((item) => item.id !== id),
      error: (error) => this.errorMessage = error.error?.message || 'Could not delete this notification.',
    });
  }

  openProfile(): void {
    this.router.navigate(['/instructor-profile']);
  }
}
