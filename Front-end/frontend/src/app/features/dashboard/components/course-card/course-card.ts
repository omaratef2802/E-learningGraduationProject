import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlay } from '@ng-icons/lucide';
import { CourseItem } from '../../dashboard.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucidePlay
    })
  ],
  templateUrl: './course-card.html',
  styleUrl: './course-card.css'
})
export class CourseCardComponent {
  @Input({ required: true }) course!: CourseItem;

  onContinue(): void {
    console.log('Continuing course:', this.course.title);
  }
}
