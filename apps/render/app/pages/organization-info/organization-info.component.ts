import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';

import type { IOrganizationInfo, IUserInfo } from '~common/interfaces';

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
    private readonly router: Router,
    private readonly organizationService: OrganizationService,
    private readonly cd: ChangeDetectorRef,
  ) {}

  public ngOnInit() {
    this.organizationService.getOrganizationInfo().subscribe(organizationInfo => this.setOrganizationInfo(organizationInfo));
    this.organizationService.getUserInfo().subscribe(userInfo => this.setUserInfo(userInfo));
  }

  private setOrganizationInfo(data: IOrganizationInfo | undefined) {
    if (!data) {
      return void this.router.navigate(['']);
    }

    this.organizationInfo = data;

    this.cd.detectChanges();
  }

  private setUserInfo(data: IUserInfo | undefined) {
    if (!data) {
      return void this.router.navigate(['']);
    }

    this.userInfo = data;

    this.cd.detectChanges();
  }
}
