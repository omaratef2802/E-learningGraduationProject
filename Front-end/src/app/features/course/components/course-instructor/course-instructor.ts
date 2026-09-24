import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IInstructor } from '../../models';

@Component({
  selector: 'app-course-instructor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-instructor.html',
  styleUrl: './course-instructor.css',
})
export class CourseInstructorComponent {
  @Input({ required: true }) instructor!: IInstructor;
}
