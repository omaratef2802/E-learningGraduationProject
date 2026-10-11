import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  let role = '';
  try {
    const encodedPayload = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
    if (!encodedPayload) throw new Error('Invalid token');
    const payload = JSON.parse(atob(encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=')));
    role = String(payload.role || '').toLowerCase();
    if (!payload.userId || !['student', 'instructor', 'admin'].includes(role)) throw new Error('Invalid token claims');
  } catch {
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }

  const url = state.url.toLowerCase();

  // Student learning pages are private to student accounts.
  if ((url.startsWith('/student-dashboard') || url.startsWith('/learning') || url.startsWith('/learn/')) && role !== 'student') {
    router.navigate(['/']);
    return false;
  }

  if (url.startsWith('/profile') && role !== 'student') {
    router.navigate(['/']);
    return false;
  }

  // Protect Admin routes
  if (url.includes('admin-') && role !== 'admin') {
    router.navigate(['/']);
    return false;
  }

  // Protect Instructor routes
  if (url.includes('instructor-') && role !== 'instructor' && role !== 'admin') {
    router.navigate(['/']);
    return false;
  }

  if (url.startsWith('/students') && role !== 'instructor' && role !== 'admin') {
    router.navigate(['/']);
    return false;
  }

  return true;
};

