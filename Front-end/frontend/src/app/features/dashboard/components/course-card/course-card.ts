import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlay,
  lucideCheck,
  lucideEye,
  lucideAward,
  lucideUser
} from '@ng-icons/lucide';
import { CourseItem } from '../../dashboard.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucidePlay,
      lucideCheck,
      lucideEye,
      lucideAward,
      lucideUser
    })
  ],
  templateUrl: './course-card.html',
  styleUrl: './course-card.css'
})
export class CourseCardComponent {
  @Input({ required: true }) course!: CourseItem;
  @Output() continue = new EventEmitter<CourseItem>();
  @Output() viewCourse = new EventEmitter<CourseItem>();
  @Output() certificate = new EventEmitter<CourseItem>();

  onContinue(): void {
    this.continue.emit(this.course);
    console.log('Continuing course:', this.course.title);
  }

  onViewCourse(): void {
    this.viewCourse.emit(this.course);
    console.log('Viewing course:', this.course.title);
  }

  onCertificate(): void {
    this.certificate.emit(this.course);
    console.log('Opening certificate for:', this.course.title);
  }
}
