import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICourseDetails } from '../../models';

@Component({
  selector: 'app-course-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './course-sidebar.html',
  styleUrl: './course-sidebar.css',
})
export class CourseSidebarComponent {
  @Input({ required: true }) course!: ICourseDetails;

  @Output() enroll = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<void>();
  @Output() wishlistToggle = new EventEmitter<boolean>();

  isWishlisted = signal(false);

  toggleWishlist(): void {
    this.isWishlisted.update((v) => !v);
    this.wishlistToggle.emit(this.isWishlisted());
  }

  onEnroll(): void {
    this.enroll.emit();
  }

  onAddToCart(): void {
    this.addToCart.emit();
  }
}
