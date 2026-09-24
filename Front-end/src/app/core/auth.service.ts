import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keys = ['token', 'accessToken', 'jwt'];

  isLoggedIn(): boolean {
    return this.keys.some((k) => !!localStorage.getItem(k));
  }
}