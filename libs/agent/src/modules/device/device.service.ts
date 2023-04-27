import type { OnModuleInit } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import { EPlatformSocketEventType } from '~common/enums';
import type { IDevice } from '~common/interfaces';
import { LogService } from '~core/log';
import { SocketClientService } from '~core/socket';

@Injectable()
export class DeviceService implements OnModuleInit {
  private devices = new Array<IDevice>();

  constructor(
    private readonly logger: LogService,
    private readonly socketClientService: SocketClientService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public onModuleInit() {
    this.socketClientService.subscribePlatformEvent(EPlatformSocketEventType.DEVICE_TOKENS_CHANGED,
      (data => {
        this.devices = data.devices;
      }));
  }

  public getDeviceByToken(deviceToken: string) {
    const device = this.devices.find(device => device.token === deviceToken);

    return device;
  }

  public setDevices(deviceTokens: IDevice[]) {
    this.devices = deviceTokens;
  }
}
