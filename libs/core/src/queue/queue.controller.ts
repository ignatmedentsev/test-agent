import { Body, Controller, RequestMethod, Req } from '@nestjs/common';
import { DiscoveryService, ModuleRef } from '@nestjs/core';
import { REQUEST_CONTEXT_ID } from '@nestjs/core/router/request/request-constants';

import { EAgentApiUrl } from '~common/enums'; // TODO: get rid of dependency
import * as interfaces from '~common/interfaces';
import { Api } from '~core/api';
import { DbService } from '~core/db';

import { QUEUE_NAME } from './queue.constants';
import { Queue } from './queue.entity';
import type { QueueInterface } from './queue.interface';
import { QueueRunner } from './queue.runner';

@Controller()
export class QueueController {
  constructor(
    private readonly db: DbService,
    private readonly discoveryService: DiscoveryService,
    private readonly moduleRef: ModuleRef,
    private readonly queueRunner: QueueRunner,
  ) {}

  @Api(EAgentApiUrl.SYS_QUEUE_ITEM_PROCESS, { method: RequestMethod.POST, useTransaction: true, systemAuth: true })
  public async processQueueItem(
    @Body('id') id: number,
    @Req() req: interfaces.IRequest,
  ) {
    const queueItem = await this.db.getRepository(Queue).findOneByOrFail({ id });
    const type = queueItem.type;

    const wrappers = this.discoveryService.getProviders()
      .filter((wrapper) => wrapper.metatype
        && Reflect.hasMetadata(QUEUE_NAME, wrapper.metatype)
        && Reflect.getMetadata(QUEUE_NAME, wrapper.metatype) === type,
      );

    const queueTask = await this.moduleRef.resolve<QueueInterface>(
      wrappers[0]!.token,
      (req as any)[REQUEST_CONTEXT_ID],
      { strict: false },
    );

    await this.queueRunner.processQueueItem(this.db, queueItem, queueTask);
  }
}
