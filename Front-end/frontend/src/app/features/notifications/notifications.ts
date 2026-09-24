import { Component } from '@angular/core';

@Component({
  selector: 'app-notifications',
  standalone: true,
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-4">
      <h1 class="text-2xl font-bold text-slate-900">Notifications</h1>
      <p class="text-slate-500">Stay updated with course announcements, assignments, and reminders.</p>
    </div>
  `
})
export class NotificationsComponent {}
