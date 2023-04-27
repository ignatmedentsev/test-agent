import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public getAuthToken() {
    return localStorage.getItem('token');
  }

  public setAuthToken(token: string) {
    localStorage.setItem('token', token);
  }

  public isLogin() {
    return Boolean(this.getAuthToken());
  }

  public logout() {
    localStorage.removeItem('token');
  }
}
