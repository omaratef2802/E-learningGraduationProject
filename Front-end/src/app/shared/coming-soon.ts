import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-coming-soon',
  imports: [RouterLink],
  template: `
    <div style="padding:48px 24px;font-family:system-ui;text-align:center">
      <h2>{{ title }}</h2>
      <p>This screen belongs to another team. Enroll check worked.</p>
      <a routerLink="/">Back to course</a>
    </div>
  `,
})
export class ComingSoon {
  title = location.pathname.includes('login') ? 'Login / Register' : 'Cart / Checkout';
}