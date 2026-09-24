import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-requirements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-requirements.html',
  styleUrl: './course-requirements.css',
})
export class CourseRequirementsComponent {
  @Input({ required: true }) requirements: string[] = [];
}
