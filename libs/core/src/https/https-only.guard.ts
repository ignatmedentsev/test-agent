import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { CoreConfigService } from '~core/services';

@Injectable()
export class HttpsOnlyGuard implements CanActivate {
  constructor(
    private readonly configService: CoreConfigService,
  ) {}

  public canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();

    if (this.configService.getHttpsEnforced() && !req.secure) {
      throw new HttpException(`HTTPS Required`, HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
