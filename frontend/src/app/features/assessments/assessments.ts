import { Component } from '@angular/core';

@Component({
  selector: 'app-assessments',
  standalone: true,
  template: `
    <div class="p-8 max-w-7xl mx-auto space-y-4">
      <h1 class="text-2xl font-bold text-slate-900">Assessments</h1>
      <p class="text-slate-500">Test your knowledge and submit your technical projects.</p>
    </div>
  `
})
export class AssessmentsComponent {}
