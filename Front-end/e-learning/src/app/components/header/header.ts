import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HEADER_CONFIG } from './header.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly router = inject(Router);
  protected readonly config = HEADER_CONFIG;
  protected isScrolled = false;

  scrollToCategories(event: Event): void {
    event.preventDefault();
    const scrollToDisciplines = (): void => {
      document.getElementById('disciplines')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (this.router.url.split('#')[0] === '/') {
      scrollToDisciplines();
      return;
    }

    this.router.navigate(['/'], { fragment: 'disciplines' }).then(() => setTimeout(scrollToDisciplines, 0));
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 12;
  }
}
