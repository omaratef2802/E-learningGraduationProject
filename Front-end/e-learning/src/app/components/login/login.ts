import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:50px; max-width:400px; margin:auto; text-align:center;">
      <h2>Test Login</h2>

      <input
        [(ngModel)]="email"
        placeholder="Email"
        style="display:block; width:100%; padding:10px; margin-bottom:10px;"
      />

      <input
        [(ngModel)]="password"
        type="password"
        placeholder="Password"
        style="display:block; width:100%; padding:10px; margin-bottom:10px;"
      />

      <button
        (click)="login()"
        style="padding:10px 20px; cursor:pointer;"
      >
        Login
      </button>

      <p style="color:red;">{{ error }}</p>
      <p style="color:green;">{{ msg }}</p>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  msg = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login() {
    this.http
      .post(
        'http://localhost:3000/E-learning/users/login',
        {
          email: this.email,
          password: this.password
        }
      )
      .subscribe({
        next: (res: any) => {
          localStorage.setItem('token', res.data || res.token);

          this.msg = 'Logged in successfully! Redirecting...';

          setTimeout(() => {
            this.router.navigate(['/instructor-dashboard']);
          }, 1000);
        },

        error: (err) => {
          this.error = 'Login failed: ' + err.message;
          console.error(err);
        }
      });
  }
}