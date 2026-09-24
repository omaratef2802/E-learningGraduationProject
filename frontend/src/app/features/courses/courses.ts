import { Component } from '@angular/core';

@Component({
  selector: 'app-courses',
  standalone: true,
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-4">
      <h1 class="text-2xl font-bold text-slate-900">My Courses</h1>
      <p class="text-slate-500">Track and manage your enrolled learning tracks.</p>
    </div>
  `
})
export class CoursesComponent {}
