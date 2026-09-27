import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HEADER_CONFIG, HeaderLink } from './header.config';

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

  isLinkActive(link: HeaderLink): boolean {
    const currentUrl = this.router.url.split('?')[0].split('#')[0];
    if (link.label === 'Home') {
      return currentUrl === '/' || currentUrl === '' || currentUrl === '/index.html';
    }
    return currentUrl === link.route;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 12;
  }
}
