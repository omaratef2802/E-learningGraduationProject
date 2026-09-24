import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucidePlay,
  lucideCheckCircle2,
  lucideClock,
  lucideArrowRight,
  lucideBookOpen
} from '@ng-icons/lucide';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideSearch,
      lucidePlay,
      lucideCheckCircle2,
      lucideClock,
      lucideArrowRight,
      lucideBookOpen
    })
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  readonly userName = signal('Naema');
}
