import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InstructorSidebar } from '../instructor-sidebar/sidebar';
import {
  InstructorData,
  InstructorNotification
} from '../instructor-data';

@Component({
  selector: 'app-instructor-notifications',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    InstructorSidebar
  ],

  templateUrl: './notifications.html',

  styleUrl: './notifications.css'
})
export class InstructorNotifications {

  private readonly router =
    inject(Router);

  protected readonly data =
    inject(InstructorData);

  protected showForm = false;

  protected title = '';

  protected message = '';

  protected type:
    InstructorNotification['type'] =
    'General';

  get notifications(): InstructorNotification[] {

    return this.data.notifications;
  }

  get notificationTypes() {

    return this.data.notificationTypes;
  }

  toggleForm(): void {

    this.showForm =
      !this.showForm;

    if (!this.showForm) {

      this.resetForm();
    }
  }

  createNotification(): void {

    if (
      !this.title.trim() ||
      !this.message.trim()
    ) {
      return;
    }

    this.data.addNotification({

      title: this.title.trim(),

      message: this.message.trim(),

      type: this.type,

      isRead: false

    });

    this.resetForm();

    this.showForm = false;
  }

  cancelForm(): void {

    this.resetForm();

    this.showForm = false;
  }

  markAsRead(
    notification: InstructorNotification
  ): void {

    this.data.markNotificationRead(
      notification.id
    );
  }

  removeNotification(
    id: string
  ): void {

    this.data.removeNotification(id);
  }

  openProfile(): void {

    this.router.navigate([
      '/instructor-profile'
    ]);
  }

  private resetForm(): void {

    this.title = '';

    this.message = '';

    this.type = 'General';
  }
}