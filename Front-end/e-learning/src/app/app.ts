import { Component, OnDestroy, signal } from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterOutlet
} from '@angular/router';

import {
  Subscription,
  filter
} from 'rxjs';

import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { Features } from './components/features/features';
import { Disciplines } from './components/disciplines/disciplines';
import { Courses } from './components/courses/courses';
import { HowItWorks } from './components/how-it-works/how-it-works';
import { Career } from './components/career/career';
import { Instructors } from './components/instructors/instructors';
import { Cta } from './components/cta/cta';
import { Footer } from './components/footer/footer';

@Component({
  imports: [
    RouterOutlet,
    Header,
    Hero,
    Features,
    Disciplines,
    Courses,
    HowItWorks,
    Career,
    Instructors,
    Cta,
    Footer
  ],

  selector: 'app-root',

  styleUrl: './app.css',

  templateUrl: './app.html',
})
export class App implements OnDestroy {

  protected readonly isHome = signal(true);

  protected readonly isDashboard = signal(false);

  protected readonly isAdmin = signal(false);

  private readonly navigationSubscription: Subscription;


  constructor(
    private readonly router: Router
  ) {

    const currentUrl =
      this.router.url.split('#')[0];

    this.updatePageState(currentUrl);


    this.navigationSubscription =
      this.router.events
        .pipe(
          filter(
            (event): event is NavigationEnd =>
              event instanceof NavigationEnd
          )
        )
        .subscribe((event) => {

          const url =
            event.urlAfterRedirects.split('#')[0];

          this.updatePageState(url);

        });
  }


  private updatePageState(url: string): void {

    this.isHome.set(
      url === '/'
    );

    this.isDashboard.set(
      url.startsWith('/instructor-')
    );

    this.isAdmin.set(
      url.startsWith('/admin-')
    );
  }


  ngOnDestroy(): void {

    this.navigationSubscription.unsubscribe();

  }

}