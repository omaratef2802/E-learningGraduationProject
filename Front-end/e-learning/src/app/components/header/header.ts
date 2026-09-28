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

  protected isDarkMode = false;

  protected currentLanguage = 'en';

  constructor() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }

    const savedLanguage = localStorage.getItem('language');

    if (savedLanguage === 'ar' || savedLanguage === 'en') {
      this.currentLanguage = savedLanguage;
    }

    this.applyLanguage();
  }

  isLinkActive(link: HeaderLink): boolean {
    const currentUrl = this.router.url.split('?')[0].split('#')[0];

    if (link.label === 'Home') {
      return (
        currentUrl === '/' ||
        currentUrl === '' ||
        currentUrl === '/index.html'
      );
    }

    return currentUrl === link.route;
  }

  scrollToCategories(event: Event): void {
    event.preventDefault();

    const scrollToDisciplines = (): void => {
      document
        .getElementById('disciplines')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    };

    if (this.router.url.split('#')[0] === '/') {
      scrollToDisciplines();
      return;
    }

    this.router
      .navigate(['/'], { fragment: 'disciplines' })
      .then(() => setTimeout(scrollToDisciplines, 0));
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 12;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  toggleLanguage(): void {
    if (this.currentLanguage === 'en') {
      this.currentLanguage = 'ar';
    } else {
      this.currentLanguage = 'en';
    }

    localStorage.setItem('language', this.currentLanguage);

    this.applyLanguage();
  }

  private applyLanguage(): void {
    document.documentElement.lang = this.currentLanguage;

    if (this.currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('arabic');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('arabic');
    }
  }
}
