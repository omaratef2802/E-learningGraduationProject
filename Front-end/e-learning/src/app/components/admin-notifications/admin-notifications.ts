import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  InstructorData,
  AdminNotification
} from '../../page/instructor-data';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';


@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [
    CommonModule,
    AdminSidebar
  ],
  templateUrl: './admin-notifications.html',
  styleUrl: './admin-notifications.css',
})
export class AdminNotifications implements OnInit {

  public readonly data =
    inject(InstructorData);

  notifications: AdminNotification[] = [];

  filteredNotifications: AdminNotification[] = [];

  selectedType:
    | 'All'
    | 'User'
    | 'Course'
    | 'System'
    | 'Report' = 'All';

  loading = false;

  errorMessage = '';


  ngOnInit(): void {

    this.loadNotifications();

  }


  loadNotifications(): void {

    try {

      this.loading = true;

      this.errorMessage = '';

      this.notifications =
        this.data.getAdminNotifications();

      this.applyFilter();

      this.loading = false;

    } catch (error) {

      console.error(
        'Admin Notifications Error:',
        error
      );

      this.errorMessage =
        'Unable to load notifications.';

      this.loading = false;

    }

  }


  applyFilter(): void {

    this.filteredNotifications =
      this.notifications.filter(
        notification =>
          this.selectedType === 'All' ||
          notification.type === this.selectedType
      );

  }


  getUnreadCount(): number {

    return this.notifications.filter(
      notification =>
        !notification.isRead
    ).length;

  }


  getReadCount(): number {

    return this.notifications.filter(
      notification =>
        notification.isRead
    ).length;

  }


  getTotalCount(): number {

    return this.notifications.length;

  }


  markAsRead(
    notification: AdminNotification
  ): void {

    this.data.markAdminNotificationRead(
      notification.id
    );

    notification.isRead = true;

  }


  markAllAsRead(): void {

    this.data.markAllAdminNotificationsRead();

    this.notifications.forEach(
      notification => {
        notification.isRead = true;
      }
    );

  }


  removeNotification(
    id: string
  ): void {

    this.data.removeAdminNotification(id);

    this.notifications =
      this.notifications.filter(
        notification =>
          notification.id !== id
      );

    this.applyFilter();

  }


  getNotificationIcon(
    type: AdminNotification['type']
  ): string {

    switch (type) {

      case 'User':
        return '♙';

      case 'Course':
        return '▣';

      case 'Report':
        return '◒';

      case 'System':
        return '⚙';

      default:
        return '•';

    }

  }

}