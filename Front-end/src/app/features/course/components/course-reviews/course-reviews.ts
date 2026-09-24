import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IRatingDistribution, IReview } from '../../models';
import { StarRatingComponent } from '../star-rating/star-rating';

@Component({
  selector: 'app-course-reviews',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './course-reviews.html',
  styleUrl: './course-reviews.css',
})
export class CourseReviewsComponent {
  @Input({ required: true }) rating: number = 0;
  @Input({ required: true }) reviewsCount: string = '';
  @Input({ required: true }) distribution: IRatingDistribution[] = [];
  @Input({ required: true }) reviews: IReview[] = [];
}
