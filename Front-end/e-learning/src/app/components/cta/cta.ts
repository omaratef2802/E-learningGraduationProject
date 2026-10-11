import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CTA_CONFIG } from './cta.config';

@Component({ selector: 'app-cta', standalone: true, imports: [RouterLink], templateUrl: './cta.html', styleUrl: './cta.css' })
export class Cta {
  private readonly router = inject(Router);
  protected readonly config = CTA_CONFIG;
  explore(): void { this.router.navigate(['/search']); }
}
