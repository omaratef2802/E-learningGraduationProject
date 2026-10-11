import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

export type AuthMode = 'login' | 'signup';
export type UserRole = 'student' | 'instructor';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  mode: AuthMode = 'login';

  // Common Form Fields
  email = '';
  password = '';

  // Signup Specific Fields
  fullName = '';
  confirmPassword = '';
  role: UserRole = 'student';
  agreeTerms = false;

  // UI State
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    const currentPath = this.route.snapshot.url[0]?.path;
    if (currentPath === 'signup' || currentPath === 'register') {
      this.mode = 'signup';
    } else {
      this.mode = 'login';
    }

    const oauthError = this.route.snapshot.queryParamMap.get('oauthError');
    if (oauthError) {
      const messages: Record<string, string> = {
        google_failed: 'Google sign-in could not be completed. Please try again.',
        github_failed: 'GitHub sign-in could not be completed. Please try again.',
        github_not_configured: 'GitHub sign-in needs OAuth app credentials in the backend configuration.',
        github_email_required: 'Verify an email address in GitHub, then try again.',
        github_cancelled: 'GitHub sign-in was cancelled.',
        github_state: 'The sign-in session expired. Please try again.',
      };
      this.errorMessage = messages[oauthError] || 'Social sign-in could not be completed. Please try again.';
    }
  }

  setMode(newMode: AuthMode): void {
    this.mode = newMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  selectRole(newRole: UserRole): void {
    this.role = newRole;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (this.mode === 'signup') {
      if (!this.fullName) {
        this.errorMessage = 'Please enter your full name.';
        return;
      }
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Passwords do not match.';
        return;
      }
      if (!this.agreeTerms) {
        this.errorMessage = 'You must agree to the Terms of Service and Privacy Policy.';
        return;
      }
      this.handleRegister();
    } else {
      this.handleLogin();
    }
  }

  private handleLogin(): void {
    this.isLoading = true;
    this.http.post('http://localhost:3000/E-learning/users/login', {
      email: this.email,
      password: this.password,
    }).subscribe({
      next: (res: any) => this.processLoginSuccess(res),
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error?.msg || 'Invalid email or password.';
      },
    });
  }

  private processLoginSuccess(res: any): void {
    this.isLoading = false;
    const token = res.token || res.data?.token || res.data;
    if (token) {
      localStorage.setItem('token', token);
    }
    this.successMessage = 'Successfully logged in! Redirecting...';
    
    let role = 'student';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role) {
          role = payload.role;
        }
      } catch (e) {
        console.error('Error decoding token', e);
      }
    }

    if (role === 'instructor') {
      this.router.navigate(['/instructor-dashboard']);
    } else if (role === 'admin') {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/student-dashboard']);
    }
  }

  private handleRegister(): void {
    this.isLoading = true;
    
    const nameParts = this.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    this.http.post('http://localhost:3000/E-learning/users/signup', {
      firstName: firstName,
      lastName: lastName,
      email: this.email,
      password: this.password,
      role: this.role,
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Switching to login...';
        this.setMode('login');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error?.msg || 'Registration failed. Please try again.';
      },
    });
  }

  socialAuth(provider: string): void {
    const normalizedProvider = provider.toLowerCase();
    if (normalizedProvider !== 'google' && normalizedProvider !== 'github') return;
    window.location.assign(`http://localhost:3000/E-learning/users/login/${normalizedProvider}`);
  }
}
