import { ChangeDetectionStrategy } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '~render/services/api.service';
import { AuthService } from '~render/services/auth.service';
import { OrganizationService } from '~render/services/organization.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  public agentKey = '';

  constructor(
    private readonly router: Router,
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly organizationService: OrganizationService,

  ) {}

  public openBaseUrl() {
    const url = 'https://www.nanox.vision/marketplace';

    this.apiService.openUrl(url)
      .subscribe({});
  }

  public authAgentKey() {
    this.apiService.agentAuth(this.agentKey)
      .subscribe({
        next: (data) => {
          this.authService.setAuthToken(data.token);
          this.organizationService.setOrganizationInfo(data.organizationInfo);
          this.organizationService.setUserInfo(data.userInfo);
          void this.router.navigate(['organization-info']);
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  public changeAgentKey(event: any) {
    this.agentKey = (event.target as HTMLInputElement).value;
  }
}
