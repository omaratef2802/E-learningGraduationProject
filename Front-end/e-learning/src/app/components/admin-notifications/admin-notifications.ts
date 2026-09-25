import {
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  InstructorData,
  AdminNotification,
  InstructorNotification,
  AdminUser
} from '../../page/instructor-data';

import { AdminSidebar } from '../../page/admin-sidebar/admin-sidebar';


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

  // =========================================================
  // DATA SERVICE
  // =========================================================

  public readonly data = inject(InstructorData);


  // =========================================================
  // NOTIFICATIONS DATA
  // =========================================================

  notifications: AdminNotification[] = [];

  filteredNotifications: AdminNotification[] = [];


  // =========================================================
  // FILTER
  // =========================================================

  selectedType:
    | 'All'
    | 'User'
    | 'Course'
    | 'System'
    | 'Report' = 'All';


  // =========================================================
  // PAGE STATE
  // =========================================================

  loading = false;

  errorMessage = '';


  // =========================================================
  // CREATE NOTIFICATION
  // =========================================================

  showCreateForm = false;

  notificationRecipient:
    | 'Admin'
    | 'Instructor' = 'Instructor';

  selectedInstructorId = '';

  newNotificationType:
    | 'User'
    | 'Course'
    | 'System'
    | 'Report' = 'System';

  newNotificationTitle = '';

  newNotificationMessage = '';

  createError = '';

  isCreating = false;


  // =========================================================
  // INSTRUCTORS
  // =========================================================

  instructors: AdminUser[] = [];


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    this.loadNotifications();

    this.loadInstructors();

  }


  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  loadNotifications(): void {

    try {

      this.loading = true;
      this.errorMessage = '';

      this.notifications =
        this.data.getAdminNotifications();

      this.applyFilter();

    } catch (error) {

      console.error(
        'Admin Notifications Error:',
        error
      );

      this.errorMessage =
        'Unable to load notifications.';

    } finally {

      this.loading = false;

    }
  }


  // =========================================================
  // LOAD INSTRUCTORS
  // =========================================================

  loadInstructors(): void {

    this.instructors =
      this.data.getAdminInstructors();

    if (
      this.instructors.length > 0 &&
      !this.selectedInstructorId
    ) {

      this.selectedInstructorId =
        this.instructors[0].id;
    }
  }


  // =========================================================
  // FILTER NOTIFICATIONS
  // =========================================================

  applyFilter(): void {

    if (this.selectedType === 'All') {

      this.filteredNotifications = [
        ...this.notifications
      ];

      return;
    }

    this.filteredNotifications =
      this.notifications.filter(
        notification =>
          notification.type === this.selectedType
      );
  }


  // =========================================================
  // NOTIFICATION COUNTS
  // =========================================================

  getTotalCount(): number {

    return this.notifications.length;

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


  // =========================================================
  // OPEN CREATE FORM
  // =========================================================

  openCreateForm(): void {

    this.showCreateForm = true;

    this.createError = '';

    this.notificationRecipient =
      'Instructor';

    this.newNotificationType =
      'System';

    this.newNotificationTitle = '';

    this.newNotificationMessage = '';

    if (this.instructors.length > 0) {

      this.selectedInstructorId =
        this.instructors[0].id;

    }

  }


  // =========================================================
  // CLOSE CREATE FORM
  // =========================================================

  closeCreateForm(): void {

    this.showCreateForm = false;

    this.createError = '';

    this.isCreating = false;

  }


  // =========================================================
  // CREATE NOTIFICATION
  // =========================================================

  createNotification(): void {

    this.createError = '';

    const title =
      this.newNotificationTitle.trim();

    const message =
      this.newNotificationMessage.trim();


    // -------------------------------------------------------
    // Validation
    // -------------------------------------------------------

    if (!title) {

      this.createError =
        'Please enter a notification title.';

      return;
    }

    if (!message) {

      this.createError =
        'Please enter a notification message.';

      return;
    }


    if (
      this.notificationRecipient ===
      'Instructor' &&
      !this.selectedInstructorId
    ) {

      this.createError =
        'Please select an instructor.';

      return;
    }


    this.isCreating = true;


    try {

      // -----------------------------------------------------
      // SEND TO ADMIN
      // -----------------------------------------------------

      if (
        this.notificationRecipient ===
        'Admin'
      ) {

        this.data.addAdminNotification({

          title,

          message,

          type:
            this.newNotificationType,

          isRead: false

        });

      }


      // -----------------------------------------------------
      // SEND TO INSTRUCTOR
      // -----------------------------------------------------

      else {

        const instructor =
          this.instructors.find(
            item =>
              item.id ===
              this.selectedInstructorId
          );

        if (!instructor) {

          this.createError =
            'Selected instructor was not found.';

          this.isCreating = false;

          return;
        }


        const instructorNotification:
          Omit<
            InstructorNotification,
            'id' | 'createdAt' | 'instructorId'
          > = {

          title,

          message,

          type:
            this.mapTypeToInstructorType(
              this.newNotificationType
            ),

          isRead: false

        };


        this.data.addInstructorNotification(

          instructor.id,

          instructorNotification

        );

      }


      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      this.closeCreateForm();

      this.loadNotifications();

    } catch (error) {

      console.error(
        'Create Notification Error:',
        error
      );

      this.createError =
        'Unable to create notification.';

      this.isCreating = false;

    }

  }


  // =========================================================
  // MAP ADMIN TYPE → INSTRUCTOR TYPE
  // =========================================================

  private mapTypeToInstructorType(
    type:
      | 'User'
      | 'Course'
      | 'System'
      | 'Report'
  ): InstructorNotification['type'] {

    switch (type) {

      case 'Course':
        return 'Course';

      case 'User':
        return 'Student';

      case 'System':
        return 'System';

      case 'Report':
        return 'General';

      default:
        return 'General';

    }

  }


  // =========================================================
  // MARK ONE NOTIFICATION AS READ
  // =========================================================

  markAsRead(
    notification: AdminNotification
  ): void {

    if (notification.isRead) {
      return;
    }

    this.data.markAdminNotificationRead(
      notification.id
    );

    notification.isRead = true;

    this.applyFilter();

  }


  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  markAllAsRead(): void {

    if (this.getUnreadCount() === 0) {
      return;
    }

    this.data.markAllAdminNotificationsRead();

    this.notifications.forEach(
      notification => {
        notification.isRead = true;
      }
    );

    this.applyFilter();

  }


  // =========================================================
  // DELETE NOTIFICATION
  // =========================================================

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


  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

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