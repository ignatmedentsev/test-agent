import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuth = false;

  public setAuth() {
    this.isAuth = true;
  }

  public isLogin() {
    return this.isAuth;
  }

  public logout() {
    this.isAuth = false;
  }
}
