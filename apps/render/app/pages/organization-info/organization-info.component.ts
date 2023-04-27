import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import type { IOrganizationInfo, IUserInfo } from '~common/interfaces';
import { ApiService } from '~render/services/api.service';

import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-organization-info',
  templateUrl: './organization-info.component.html',
  styleUrls: ['./organization-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationInfoComponent implements OnInit {
  public organizationInfo: IOrganizationInfo;
  public userInfo: IUserInfo;

  constructor(
    private readonly apiService: ApiService,
    private readonly organizationService: OrganizationService,
    private readonly cd: ChangeDetectorRef,
  ) {}

  public ngOnInit() {
    const organizationInfo = this.organizationService.getOrganizationInfo();
    const userInfo = this.organizationService.getUserInfo();

    if (organizationInfo && userInfo) {
      this.organizationInfo = organizationInfo;
      this.userInfo = userInfo;
    }

    if (!this.organizationInfo && !this.userInfo) {
      this.apiService.getOrganizationInfo()
        .subscribe({
          next: (data) => {
            this.organizationInfo = this.organizationService.setOrganizationInfo(data.organizationInfo);
            this.userInfo = this.organizationService.setUserInfo(data.userInfo);

            this.cd.detectChanges();
          },
          error: (error) => {
            console.log(error);
          },
        });
    }
  }
}
