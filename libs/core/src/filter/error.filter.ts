import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import type { AxiosError } from 'axios';
import type { Response, Request } from 'express';

import type { IRequest } from '~common/interfaces';
import { ApiRegistry } from '~core/api';
import { TxRegistry } from '~core/db';
import { LogService } from '~core/log';

@Catch()
export class ErrorFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LogService,
    private readonly txRegistry: TxRegistry,
    private readonly apiRegistry: ApiRegistry,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public async catch(error: Error, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const { url, body, query } = host.switchToHttp().getRequest<Request>();

    let errorMessage: string = error.message || error as unknown as string;
    let errorStack: string = error.stack || '';
    let resStatus = 500;

    if (this.isAxiosError(error)) {
      errorMessage = error.response?.data.message || '';
      errorStack = error.response?.data.stack || '';
      resStatus = error.response?.status || 500;
    }

    if (error instanceof HttpException) {
      resStatus = error.getStatus();
    }

    const responseResult: { message: string, stack?: string } = { message: errorMessage };
    const logMessage = `Error while call api ${url}`
    + `\nBody: ${this.logger.prepareData(body)}`
    + `\nQuery: ${this.logger.prepareData(query)}`
    + `\nCode: ${resStatus}`
    + `\nMessage: ${errorMessage}`
    + `\nStack: ${errorStack}`;

    if (process.env.NODE_ENV === 'dev') {
      responseResult.stack = errorStack;
    }

    this.logger.error(logMessage);

    const req = host.switchToHttp().getRequest<IRequest & Request>();
    const uid = req.transactionId;
    if (uid) {
      const url = req.url.split('?')[0];
      const queryRunner = this.txRegistry.getByKey(uid);
      const apiConfig = url ? this.apiRegistry.getApiOptions(url) : undefined;

      if (queryRunner?.isTransactionActive) {
        if (!apiConfig?.noLog) {
          this.logger.debug(`Rolling back database transaction for API ${url}: transactionId ${uid}`);
        }
        await queryRunner.rollbackTransaction();
        if (!apiConfig?.noLog) {
          this.logger.debug(`Database transaction for API ${url} was rolled back: transactionId ${uid}`);
        }
      }

      if (!queryRunner?.isReleased) {
        if (!apiConfig?.noLog) {
          this.logger.debug(`Releasing query runner of database transaction for API ${url}: transactionId ${uid}`);
        }
        await queryRunner?.release();
        if (!apiConfig?.noLog) {
          this.logger.debug(`Query runner of database transaction for API ${url} was released: transactionId ${uid}`);
        }
      }
      this.txRegistry.delete(uid);
    }

    return response.status(resStatus).send(responseResult);
  }

  private isAxiosError(error: any): error is AxiosError<{ message: string, stack: string }, any> {
    return error.isAxiosError;
  }
}
