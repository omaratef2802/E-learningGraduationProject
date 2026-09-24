import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlay, lucideCheckCircle2, lucideClock } from '@ng-icons/lucide';
import { StatItem } from '../../dashboard.model';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucidePlay,
      lucideCheckCircle2,
      lucideClock
    })
  ],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css'
})
export class StatCardComponent {
  @Input({ required: true }) stat!: StatItem;
}
