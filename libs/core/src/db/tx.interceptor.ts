import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { tap } from 'rxjs/operators';

import type { IRequest } from '~common/interfaces';
import { ApiRegistry } from '~core/api';

import { TxRegistry } from './tx.registry';

/**
 * Interceptor that commits, rollbacks and releases transactions started in TxMiddleware.
 */
@Injectable()
export class TxInterceptor implements NestInterceptor {
  constructor(
    private readonly txRegistry: TxRegistry,
    private readonly apiRegistry: ApiRegistry,
  ) { }

  public intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<IRequest & Request>();
    const url = req.url.split('?')[0];
    const apiConfig = url ? this.apiRegistry.getApiOptions(url) : undefined;

    if (!apiConfig?.useTransaction) {
      return next.handle();
    }

    const uid = req.transactionId;

    const queryRunner = uid ? this.txRegistry.getByKey(uid) : undefined;

    return next
      .handle()
      .pipe(
        tap({
          next: async () => {
            if (queryRunner?.isTransactionActive) {
              await queryRunner?.commitTransaction();
            }
            if (!queryRunner?.isReleased) {
              await queryRunner?.release();
            }
            if (uid) {
              this.txRegistry.delete(uid);
            }
          },
          error: async () => {
            // Errors are processed in ErrorFilter
            // because we need to close transactions for API failed by guards
          },
        }),
      );
  }
}
