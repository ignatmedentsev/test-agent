import { Injectable } from '@angular/core';
import type { CanActivate } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '~render/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate() {
    return this.authService.isLogin() ? true : this.router.createUrlTree(['']);
  }
}
