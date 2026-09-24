import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stars-row" [style.gap.px]="gap">
      @for (star of starsArray; track $index) {
        <svg
          [attr.width]="size"
          [attr.height]="size"
          viewBox="0 0 24 24"
          [attr.fill]="star <= rating ? '#f59e0b' : '#e2e8f0'"
          [attr.stroke]="star <= rating ? '#f59e0b' : '#cbd5e1'"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      }
    </div>
  `,
  styles: [`
    .stars-row {
      display: inline-flex;
      align-items: center;
    }
  `]
})
export class StarRatingComponent {
  @Input() rating: number = 5;
  @Input() maxStars: number = 5;
  @Input() size: number = 15;
  @Input() gap: number = 2;

  get starsArray(): number[] {
    return Array.from({ length: this.maxStars }, (_, i) => i + 1);
  }
}
