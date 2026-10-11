import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  template: `
    <main class="oauth-status" role="status" aria-live="polite">
      <span class="oauth-spinner" aria-hidden="true"></span>
      <h1>Finishing sign in</h1>
      <p>One moment while we open your learning space.</p>
    </main>
  `,
  styles: [`
    :host { display: grid; min-height: 70vh; place-items: center; padding: 24px; font-family: 'Segoe UI', sans-serif; color: #292b40; }
    .oauth-status { text-align: center; }
    .oauth-spinner { display: inline-block; width: 36px; height: 36px; border: 3px solid #e7e7ff; border-top-color: #6965f5; border-radius: 50%; animation: spin .75s linear infinite; }
    h1 { margin: 18px 0 6px; font-size: 22px; }
    p { margin: 0; color: #7c8095; font-size: 14px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class OAuthCallbackComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const token = fragment.get('token');
    if (!token) {
      void this.router.navigate(['/login'], { queryParams: { oauthError: 'missing_token' } });
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.userId || !['student', 'instructor', 'admin'].includes(payload.role)) throw new Error('Invalid sign-in token');
      localStorage.setItem('token', token);
      const destination = payload.role === 'instructor'
        ? '/instructor-dashboard'
        : payload.role === 'admin'
          ? '/admin-dashboard'
          : '/student-dashboard';
      void this.router.navigate([destination], { replaceUrl: true });
    } catch {
      void this.router.navigate(['/login'], { queryParams: { oauthError: 'invalid_token' } });
    }
  }
}
