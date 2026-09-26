import { Component } from '@angular/core';
import { HOW_IT_WORKS_CONFIG } from './how-it-works.config';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css',
})
export class HowItWorks {
  protected readonly config = HOW_IT_WORKS_CONFIG;
}
