import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlay, lucideBookOpen, lucideClock } from '@ng-icons/lucide';
import { ContinueLearningItem } from '../../dashboard.model';

@Component({
  selector: 'app-continue-learning',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucidePlay,
      lucideBookOpen,
      lucideClock
    })
  ],
  templateUrl: './continue-learning.html',
  styleUrl: './continue-learning.css'
})
export class ContinueLearningComponent {
  @Input({ required: true }) item!: ContinueLearningItem;

  onResume(): void {
    console.log('Resuming lesson:', this.item.title);
  }
}
