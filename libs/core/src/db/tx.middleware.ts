import type { NestMiddleware } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';

import type { IRequest } from '~common/interfaces';
import { generateShortUid } from '~common/utils/crypt';
import { ApiRegistry } from '~core/api';
import { LogService } from '~core/log';

import { NonTxDbService } from './non-tx.db.service';
import { TxRegistry } from './tx.registry';

/**
 * Middleware that starts a database transaction.
 * Only starts -- its commit, rollback and release are processed via TxInterceptor.
 */
@Injectable()
export class TxMiddleware implements NestMiddleware {
  constructor(
    private readonly nonTxDb: NonTxDbService,
    private readonly txRegistry: TxRegistry,
    private readonly apiRegistry: ApiRegistry,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public async use(req: Request & IRequest, _: Response, next: Function) {
    const url = req.url.split('?')[0];
    const apiConfig = url ? this.apiRegistry.getApiOptions(url) : undefined;

    if (!apiConfig) {
      throw new HttpException(`Endpoint "${url}" is not supported"`, HttpStatus.NOT_FOUND);
    }

    if (apiConfig.useTransaction) {
      const uid = generateShortUid(16);

      req.transactionId = uid;

      const queryRunner = this.nonTxDb.connection.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      this.txRegistry.register(uid, queryRunner);

      if (!apiConfig.noLog) {
        const activeTxCount = this.txRegistry.getMap().size;
        this.logger.debug(`Using database transaction for API ${url}, transactionId: ${uid}, active txs: ${activeTxCount}`);
      }
    }

    next();
  }
}
