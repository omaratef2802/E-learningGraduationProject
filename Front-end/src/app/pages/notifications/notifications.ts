import { Component, computed, signal } from '@angular/core';

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'enrollment' | 'section' | 'exam' | 'completion' | 'certificate' | 'new_course';
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  activeNav = signal<string>('notifications');

  notifications = signal<NotificationItem[]>([
    {
      id: 1,
      title: 'Course Enrollment Confirmed',
      description: 'You are now enrolled in Full-Stack Web Development.',
      time: '10 minutes ago',
      unread: true,
      type: 'enrollment',
    },
    {
      id: 2,
      title: 'Section Completed',
      description: 'You completed Section 2 of React Frontend Development.',
      time: '2 hours ago',
      unread: true,
      type: 'section',
    },
    {
      id: 3,
      title: 'Exam Result',
      description: 'You passed the JavaScript Fundamentals section exam with 90%.',
      time: 'Yesterday',
      unread: true,
      type: 'exam',
    },
    {
      id: 4,
      title: 'Course Completed',
      description: 'Congratulations! You completed Full-Stack Web Development.',
      time: '2 days ago',
      unread: false,
      type: 'completion',
    },
    {
      id: 5,
      title: 'Certificate Issued',
      description: 'Your certificate for Full-Stack Web Development is now available.',
      time: '2 days ago',
      unread: false,
      type: 'certificate',
    },
    {
      id: 6,
      title: 'New Course Available',
      description: 'A new course has been added to your selected track.',
      time: '3 days ago',
      unread: false,
      type: 'new_course',
    },
  ]);

  navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'my-learning', label: 'My Learning' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'profile', label: 'Profile' },
    { id: 'settings', label: 'Settings' },
  ];

  unreadCount = computed(() => this.notifications().filter((item) => item.unread).length);

  setActiveNav(id: string): void {
    this.activeNav.set(id);
  }

  markAllAsRead(): void {
    this.notifications.update((items) =>
      items.map((item) => ({
        ...item,
        unread: false,
      })),
    );
  }

  toggleReadStatus(id: number): void {
    this.notifications.update((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              unread: !item.unread,
            }
          : item,
      ),
    );
  }

  deleteNotification(id: number): void {
    this.notifications.update((items) => items.filter((item) => item.id !== id));
  }
}
