import { Body, Controller, RequestMethod, Req } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';

import { EAgentApiUrl } from '~common/enums';
import * as interfaces from '~common/interfaces';
import { Api } from '~core/api';

import { DbService } from '../db';

import { CRON_NAME } from './cron.constants';
import type { CronInterface } from './cron.interface';
import { CronRunner } from './cron.runner';

@Controller()
export class CronController {
  constructor(
    private readonly db: DbService,
    private readonly discoveryService: DiscoveryService,
    private readonly moduleRef: ModuleRef,
    private readonly cronRunner: CronRunner,
  ) {}

  @Api(EAgentApiUrl.SYS_CRON_ITEM_PROCESS, { method: RequestMethod.POST, useTransaction: true, systemAuth: true })
  public async processCronItem(
    @Body('name') name: string,
    @Req() req: interfaces.IRequest,
  ) {
    const wrappers = this.discoveryService.getProviders()
      .filter((wrapper) => wrapper.metatype
        && Reflect.hasMetadata(CRON_NAME, wrapper.metatype)
        && Reflect.getMetadata(CRON_NAME, wrapper.metatype) === name,
      );

    const cronTask = await this.moduleRef.resolve<CronInterface>(
      wrappers[0]!.token,
      (req as any)[REQUEST_CONTEXT_ID],
      { strict: false },
    );

    await this.cronRunner.processCronTask(this.db, name, cronTask);
  }
}
