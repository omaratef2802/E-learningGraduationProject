import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  currentLanguage = 'en';

  constructor() {
    const savedLanguage = localStorage.getItem('language');

    if (savedLanguage === 'ar' || savedLanguage === 'en') {
      this.currentLanguage = savedLanguage;
    }

    this.applyLanguage();
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

  applyLanguage(): void {
    document.documentElement.lang = this.currentLanguage;

    if (this.currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('arabic');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('arabic');
    }
  }

  isArabic(): boolean {
    return this.currentLanguage === 'ar';
  }
}
