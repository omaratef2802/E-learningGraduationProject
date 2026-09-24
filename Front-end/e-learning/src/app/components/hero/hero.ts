import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HERO_CONFIG } from './hero.config';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  private readonly router = inject(Router);
  protected readonly config = HERO_CONFIG;

  search(query: string): void {
    const value = query.trim();
    this.router.navigate(['/search'], { queryParams: value ? { q: value } : {} });
  }
}
