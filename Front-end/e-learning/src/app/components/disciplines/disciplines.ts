import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DISCIPLINES_CONFIG } from './disciplines.config';

@Component({
  selector: 'app-disciplines',
  standalone: true,
  templateUrl: './disciplines.html',
  styleUrl: './disciplines.css',
})
export class Disciplines {
  private readonly router = inject(Router);
  protected readonly config = DISCIPLINES_CONFIG;

  explore(query: string): void {
    this.router.navigate(['/search'], { queryParams: { q: query } });
  }
}
