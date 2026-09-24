import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IRelatedCourse } from '../../models';

@Component({
  selector: 'app-course-related',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-related.html',
  styleUrl: './course-related.css',
})
export class CourseRelatedComponent {
  @Input({ required: true }) courses: IRelatedCourse[] = [];
}
