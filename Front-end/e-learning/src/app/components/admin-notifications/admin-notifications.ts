import {
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminService } from '../../services/admin.service';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'User' | 'Course' | 'System' | 'Report';
  isRead: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],
  templateUrl: './admin-notifications.html',
  styleUrl: './admin-notifications.css',
})
export class AdminNotifications implements OnInit {

  private adminService = inject(AdminService);

  notifications: AdminNotification[] = [];
  filteredNotifications: AdminNotification[] = [];
  instructors: any[] = [];

  selectedType: 'All' | 'User' | 'Course' | 'System' | 'Report' = 'All';

  loading = false;
  errorMessage = '';

  showCreateForm = false;
  notificationRecipient: 'Admin' | 'Instructor' = 'Instructor';
  selectedInstructorId = '';
  newNotificationType: 'User' | 'Course' | 'System' | 'Report' = 'System';
  newNotificationTitle = '';
  newNotificationMessage = '';
  createError = '';
  isCreating = false;

  ngOnInit(): void {
    this.loadNotifications();
    this.loadInstructors();
  }

  loadNotifications(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminService.getNotifications().subscribe({
       next: (res: any) => {
         const notifs = res.data || res || [];
         this.notifications = notifs.map((n: any) => ({
            id: n._id || n.id,
            title: n.title,
            message: n.message,
            type: n.type || 'System',
            isRead: n.isRead || false,
            createdAt: n.createdAt || new Date().toISOString()
         }));
         this.applyFilter();
         this.loading = false;
       },
       error: (err) => {
         console.error('Admin Notifications Error:', err);
         this.errorMessage = 'Unable to load notifications.';
         this.loading = false;
       }
    });
  }

  loadInstructors(): void {
    this.adminService.getAllInstructors().subscribe({
       next: (res: any) => {
         this.instructors = (res.data || res || []).map((i: any) => ({ id: i._id || i.id, name: i.username || i.name || `${i.firstName} ${i.lastName}` }));
         if (this.instructors.length > 0 && !this.selectedInstructorId) {
            this.selectedInstructorId = this.instructors[0].id;
         }
       },
       error: (err) => console.error('Unable to load instructors', err)
    });
  }

  applyFilter(): void {
    if (this.selectedType === 'All') {
      this.filteredNotifications = [...this.notifications];
      return;
    }
    this.filteredNotifications = this.notifications.filter(n => n.type === this.selectedType);
  }

  getTotalCount(): number { return this.notifications.length; }
  getUnreadCount(): number { return this.notifications.filter(n => !n.isRead).length; }
  getReadCount(): number { return this.notifications.filter(n => n.isRead).length; }

  openCreateForm(): void {
    this.showCreateForm = true;
    this.createError = '';
    this.notificationRecipient = 'Instructor';
    this.newNotificationType = 'System';
    this.newNotificationTitle = '';
    this.newNotificationMessage = '';
    if (this.instructors.length > 0) {
      this.selectedInstructorId = this.instructors[0].id;
    }
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.createError = '';
    this.isCreating = false;
  }

  createNotification(): void {
    this.createError = '';
    const title = this.newNotificationTitle.trim();
    const message = this.newNotificationMessage.trim();

    if (!title) { this.createError = 'Please enter a notification title.'; return; }
    if (!message) { this.createError = 'Please enter a notification message.'; return; }
    if (this.notificationRecipient === 'Instructor' && !this.selectedInstructorId) {
      this.createError = 'Please select an instructor.'; return;
    }

    this.isCreating = true;
    
    // We send it via our backend API
    const payload = {
       title,
       message,
       type: this.newNotificationType,
       recipientType: this.notificationRecipient,
       recipientId: this.notificationRecipient === 'Instructor' ? this.selectedInstructorId : null
    };

    this.adminService.sendNotification(payload).subscribe({
       next: () => {
         this.closeCreateForm();
         this.loadNotifications();
       },
       error: (err) => {
         console.error('Create Notification Error:', err);
         this.createError = 'Unable to create notification.';
         this.isCreating = false;
       }
    });
  }

  markAsRead(notification: AdminNotification): void {
    if (notification.isRead) return;
    // Assuming you add an update/mark-read endpoint in AdminService if needed:
    // this.adminService.markNotificationAsRead(notification.id).subscribe(...)
    notification.isRead = true;
    this.applyFilter();
  }

  markAllAsRead(): void {
    if (this.getUnreadCount() === 0) return;
    this.notifications.forEach(n => n.isRead = true);
    this.applyFilter();
  }

  removeNotification(id: string): void {
    this.adminService.deleteNotification(id).subscribe({
       next: () => {
         this.notifications = this.notifications.filter(n => n.id !== id);
         this.applyFilter();
       },
       error: (err) => console.error(err)
    });
  }

  getNotificationIcon(type: AdminNotification['type']): string {
    switch (type) {
      case 'User': return '♙';
      case 'Course': return '▣';
      case 'Report': return '◒';
      case 'System': return '⚙';
      default: return '•';
    }
  }
}