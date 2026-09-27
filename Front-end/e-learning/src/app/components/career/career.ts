import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CAREER_CONFIG } from './career.config';

@Component({
  selector: 'app-career',
  standalone: true,
  templateUrl: './career.html',
  styleUrl: './career.css',
})
export class Career {
  private readonly router = inject(Router);
  protected readonly config = CAREER_CONFIG;

  explore(): void {
    this.router.navigate(['/search'], { queryParams: { q: 'career development' } });
  }
}
