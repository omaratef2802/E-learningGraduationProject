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
      next: (res: any) => {
        this.isLoading = false;
        const token = res.token || res.data?.token || res.data;
        if (token) {
          localStorage.setItem('token', token);
        }
        this.successMessage = 'Successfully logged in! Redirecting...';
        setTimeout(() => {
          if (res.user?.role === 'instructor' || this.email.includes('instructor')) {
            this.router.navigate(['/instructor-dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        }, 800);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error?.msg || 'Invalid email or password.';
      },
    });
  }

  private handleRegister(): void {
    this.isLoading = true;
    this.http.post('http://localhost:3000/E-learning/users/signup', {
      name: this.fullName,
      email: this.email,
      password: this.password,
      role: this.role,
    }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Switching to login...';
        setTimeout(() => {
          this.setMode('login');
        }, 1200);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error?.msg || 'Registration failed. Please try again.';
      },
    });
  }

  socialAuth(provider: string): void {
    alert(`Connecting with ${provider}...`);
  }
}
