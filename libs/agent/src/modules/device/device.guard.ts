import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { LogService } from '~core/log';

import { DeviceService } from './device.service';

@Injectable()
export class DeviceGuard implements CanActivate {
  constructor(
    private readonly logger: LogService,
    private readonly deviceService: DeviceService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    if (!req.body.deviceToken) {
      throw new HttpException(`Field 'deviceToken' is required`, HttpStatus.BAD_REQUEST);
    }

    if (!this.deviceService.getDeviceByToken(req.body.deviceToken)) {
      throw new HttpException(`Invalid 'deviceToken'`, HttpStatus.BAD_REQUEST);
    }

    return true;
  }
}
