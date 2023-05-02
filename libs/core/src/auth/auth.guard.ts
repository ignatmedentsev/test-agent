import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ApiRegistry } from '~core/api';
import { LogService } from '~core/log';
import { CoreConfigService } from '~core/services';

// TODO: remove, refactor to @nestjs/passport
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly apiRegistry: ApiRegistry,
    private readonly configService: CoreConfigService,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const url = req.originalUrl.split('?')[0];
    const apiConfig = url ? this.apiRegistry.getApiOptions(url) : undefined;

    if (!apiConfig) {
      const errorMessage = `API for url ${url} does not exist`;
      this.logger.error(errorMessage);

      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }

    if (apiConfig.systemAuth) {
      const internalKey = this.configService.getSecretKeyForInternalRequest();
      const secretKeyFromRequest = req.body.secretKey || req.query.secretKey;

      if (internalKey !== secretKeyFromRequest) {
        const errorMessage = `System authorization failed for "${url}"`;

        throw new HttpException(errorMessage, HttpStatus.UNAUTHORIZED);
      }

      return true;
    }

    if (apiConfig.skipAuth) {
      return true;
    }

    // TODO: add auth
    return true;
  }
}
