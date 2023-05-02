import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import merge from 'lodash/merge';
import { BehaviorSubject } from 'rxjs';

import { AgentApiClientService } from '~agent/modules/agent-api-client';
import {
  EOrganizationSettings,
  EOrganizationType,
  EPlatformSocketEventType,
  ERenderSocketEventType,
} from '~common/enums';
import type { IOrganizationInfo, IUserInfo } from '~common/interfaces';
import type { TOrganizationSettingChange } from '~common/types';
import { AuthService } from '~core/auth';
import { LogService } from '~core/log';
import { SocketClientService, SocketService } from '~core/socket';

// TODO: Should we add FORCE_LOGOUT?
@Injectable()
export class OrganizationService implements OnApplicationBootstrap, OnApplicationShutdown {
  public isOrganizationServiceInit = new BehaviorSubject(false);
  private organizationInfo: IOrganizationInfo | null = null;
  private userInfo: IUserInfo | null = null;

  private organizationChangedListener: ((data: IOrganizationInfo) => void) | null = null;
  private organizationSettingsChangedListener: (<K extends EOrganizationSettings>(data: TOrganizationSettingChange<K>) => void) | null = null;

  private userChangedListener: ((data: IUserInfo) => void) | null = null;
  constructor(
    private readonly agentApiClientService: AgentApiClientService,
    private readonly authService: AuthService,
    private readonly logger: LogService,
    private readonly socketClientService: SocketClientService,
    private readonly socketService: SocketService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  onApplicationBootstrap() {
    this.authService.isAuth.subscribe({
      next: async (value) => {
        if (value) {
          await this.initOrganizationService();
        } else {
          this.clearOrganizationService();
        }
      },
    });
  }

  onApplicationShutdown() {
    this.unsubscribeSocketEvents();
  }

  public subscribeSocketEvents() {
    if (!this.organizationChangedListener) {
      this.organizationChangedListener = this.socketClientService.subscribePlatformEvent(
        EPlatformSocketEventType.ORGANIZATION_CHANGED,
        (payload: IOrganizationInfo) => {
          this.setOrganizationInfo(payload);
        });
    }
    if (!this.organizationSettingsChangedListener) {
      this.organizationSettingsChangedListener = this.socketClientService.subscribePlatformEvent(
        EPlatformSocketEventType.ORGANIZATION_SETTINGS_CHANGED,
        <K extends EOrganizationSettings>(data: TOrganizationSettingChange<K>) => {
          const updatedOrganizationInfo = this.updateOrganizationInfoFromChangedSettings(data);
          if (updatedOrganizationInfo) {
            this.setOrganizationInfo(updatedOrganizationInfo);
          }
        });
    }
    if (!this.userChangedListener) {
      this.userChangedListener = this.socketClientService.subscribePlatformEvent(
        EPlatformSocketEventType.USER_CHANGED, (data: IUserInfo) => {
          this.setUserInfo(data);
        });
    }
  }

  public unsubscribeSocketEvents() {
    if (this.organizationChangedListener) {
      this.socketClientService.unsubscribePlatformEvent(EPlatformSocketEventType.ORGANIZATION_CHANGED, this.organizationChangedListener);
      this.organizationChangedListener = null;
    }

    if (this.organizationSettingsChangedListener) {
      this.socketClientService.unsubscribePlatformEvent(
        EPlatformSocketEventType.ORGANIZATION_SETTINGS_CHANGED,
        this.organizationSettingsChangedListener,
      );
      this.organizationSettingsChangedListener = null;
    }

    if (this.userChangedListener) {
      this.socketClientService.unsubscribePlatformEvent(EPlatformSocketEventType.USER_CHANGED, this.userChangedListener);
      this.userChangedListener = null;
    }
  }

  public getOrganizationInfo() {
    return this.organizationInfo;
  }

  public setOrganizationInfo(organizationInfo: IOrganizationInfo) {
    this.organizationInfo = organizationInfo;

    this.socketService.server.emit(ERenderSocketEventType.ORGANIZATION_CHANGED, organizationInfo);
  }

  public getEmail() {
    return this.organizationInfo?.email;
  }

  public getName() {
    return this.organizationInfo?.name;
  }

  public isRadiology() {
    return this.organizationInfo?.type === EOrganizationType.RADIOLOGY;
  }

  public isDistributor() {
    return this.organizationInfo?.type === EOrganizationType.DISTRIBUTOR;
  }

  public isAdmin() {
    return this.organizationInfo?.type === EOrganizationType.ADMIN;
  }

  public isIF() {
    return this.organizationInfo?.type === EOrganizationType.IMAGING_FACILITY;
  }

  public isAiCompany() {
    return this.organizationInfo?.type === EOrganizationType.AI_COMPANY;
  }

  public getUserFirstName() {
    return this.userInfo?.firstName;
  }

  public getUserLastName() {
    return this.userInfo?.lastName;
  }

  public getUserInfo() {
    return this.userInfo;
  }

  public setUserInfo(userInfo: IUserInfo) {
    this.userInfo = userInfo;

    this.socketService.server.emit(ERenderSocketEventType.USER_CHANGED, userInfo);

    return this.userInfo;
  }

  public getUserId() {
    return this.userInfo?.id;
  }

  public getUserOrganizations() {
    return this.userInfo?.organizations;
  }

  public isChief(userId: number) {
    return userId === this.organizationInfo?.chiefId;
  }

  public isMedcloudInternal() {
    return this.organizationInfo?.isMedcloudInternal;
  }

  public isChiefLoggedIn() {
    return this.organizationInfo?.chiefId
      && this.userInfo?.id === this.organizationInfo?.chiefId;
  }

  private async initOrganizationService() {
    try {
      const getOrganizationInfo = await this.agentApiClientService.getOrganizationInfo();

      this.organizationInfo = getOrganizationInfo.organizationInfo;
      this.userInfo = getOrganizationInfo.userInfo;

      if (this.organizationInfo.id) {
        this.subscribeSocketEvents();
      }
      this.isOrganizationServiceInit.next(true);
    } catch (error) {
      this.logger.error('Failed to get organization info, agent not authorized');
    }
  }

  private clearOrganizationService() {
    this.organizationInfo = null;
    this.userInfo = null;
    this.unsubscribeSocketEvents();
    this.isOrganizationServiceInit.next(false);
  }

  private updateOrganizationInfoFromChangedSettings<K extends EOrganizationSettings>(data: TOrganizationSettingChange<K>) {
    let updatedOrganizationInfo: Partial<IOrganizationInfo>;
    switch (data.name) {
      case EOrganizationSettings.MEDCLOUD_INTERNAL: {
        updatedOrganizationInfo = { isMedcloudInternal: data.value };

        return merge({}, this.organizationInfo, updatedOrganizationInfo);
      }

      default: {
        this.logger.error(`Unknown organization setting: ${this.logger.prepareData(data)}`);
      }
    }
  }
}
