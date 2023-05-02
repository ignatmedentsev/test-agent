import { Injectable } from '@angular/core';
import type { CanActivate } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService } from '~render/services/auth.service';

@Injectable({ providedIn: 'root' })
export class MainGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  canActivate() {
    if (!this.authService.isLogin()) {
      return true;
    }

    return this.router.createUrlTree(['organization-info']);
  }
}
