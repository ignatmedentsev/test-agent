import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

import { ERenderSocketEventType } from '~common/enums';

import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { OrganizationService } from './services/organization.service';
import { SocketService } from './services/socket.service';

@Injectable({ providedIn: 'root' })
export class AppInitService {
  constructor(
    private readonly apiService: ApiService,
    private readonly organizationService: OrganizationService,
    private readonly socketService: SocketService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.socketService.on(ERenderSocketEventType.REFRESH_AGENT_KEY, async () => {
      await this.logout();
    });
    this.socketService.on(ERenderSocketEventType.ORGANIZATION_CHANGED, (organizationInfo) => {
      this.organizationService.setOrganizationInfo(organizationInfo);
    });
    this.socketService.on(ERenderSocketEventType.USER_CHANGED, (userInfo) => {
      this.organizationService.setUserInfo(userInfo);
    });
  }

  public async init() {
    try {
      const { organizationInfo, userInfo, token } = await lastValueFrom(this.apiService.getOrganizationInfo());

      if (!token) {
        await this.logout();
      } else {
        this.authService.setAuth();
      }

      if (organizationInfo && userInfo) {
        this.organizationService.setOrganizationInfo(organizationInfo);
        this.organizationService.setUserInfo(userInfo);
      }
    } catch (error) {
      console.log(error);
    }
  }

  private async logout() {
    this.authService.logout();
    this.organizationService.clearInfo();
    await this.router.navigate(['']);
  }
}
