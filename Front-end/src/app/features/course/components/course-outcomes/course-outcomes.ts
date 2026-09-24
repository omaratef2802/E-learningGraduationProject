import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-outcomes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-outcomes.html',
  styleUrl: './course-outcomes.css',
})
export class CourseOutcomesComponent {
  @Input({ required: true }) outcomes: string[] = [];

  isExpanded = signal(false);

  toggleExpand(): void {
    this.isExpanded.update((v) => !v);
  }
}
