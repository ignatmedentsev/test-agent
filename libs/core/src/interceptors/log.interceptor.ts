import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { tap } from 'rxjs/operators';

import { LogService } from '~core/log';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public intercept(context: ExecutionContext, next: CallHandler) {
    const startTime = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const httpMethod = req.method?.toUpperCase();
    const url = req.url.split('?')[0];

    this.logger.debug(`Request started: ${httpMethod} ${url}`);

    return next
      .handle()
      .pipe(
        tap({
          next: () => {
            const durationMs = Date.now() - startTime;
            const res = context.switchToHttp().getResponse<Response>();
            this.logger.debug(`Request completed: ${httpMethod} ${url}. Status: ${res.statusCode}. Duration: ${durationMs}`);
          },
          error: (error) => {
            const durationMs = Date.now() - startTime;
            const errorMessage: string = error.message || error as string;
            const errorStack: string = error.stack || '';

            let loggerMessage = `Request completed with error: ${httpMethod} ${url}. Duration: ${durationMs}`;

            if (errorMessage) {
              loggerMessage = loggerMessage + '. ' + `Error message: ${errorMessage}`;
            }
            if (errorStack) {
              loggerMessage = loggerMessage + '. ' + `Error stack: ${errorStack}`;
            }

            this.logger.error(loggerMessage);
          },
        }),
      );
  }
}
