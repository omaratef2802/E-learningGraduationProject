import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICourseDetails } from '../../models';
import { StarRatingComponent } from '../star-rating/star-rating';

@Component({
  selector: 'app-course-header',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './course-header.html',
  styleUrl: './course-header.css',
})
export class CourseHeaderComponent {
  @Input({ required: true }) course!: ICourseDetails;
}
