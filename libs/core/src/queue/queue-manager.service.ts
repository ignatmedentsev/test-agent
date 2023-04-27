import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

import { LogService } from '../log';

import { EQueueStatus } from './queue.enums';
import { QueueRegistry } from './queue.registry';
import { QueueRepository } from './queue.repository';
import { QueueService } from './queue.service';

// TODO: add statistics for queues
@Injectable()
export class QueueManagerService extends EventEmitter {
  constructor(
    private readonly logger: LogService,
    private readonly queue: QueueService,
    private readonly registry: QueueRegistry,
    private readonly queueRepository: QueueRepository,
  ) {
    super();
    logger.setContext(this.constructor.name);
  }

  public async reprocessStuckItems() {
    const result = new Array<number>();

    return Promise.resolve(result);
  }

  public async interruptQueue(type: string, modifier: string) {
    if (!this.registry.isQueueInProgress(type, modifier)) {
      throw new Error('Queue cannot be interrupted due to it is not running');
    }

    const task = await this.getLastInProgressTask(type, modifier);

    await this.queueRepository.save({
      id: task.id!,
      error: 'Interrupted',
      status: EQueueStatus.FAILED,
    });

    this.registry.markQueueAsDone(type, modifier);

    this.logger.warn(`Interrupt queue "${type}-${modifier}"`);
  }

  public async clearQueue(type: string, modifier: string) {
    await this.queueRepository.delete({ type, modifier });
  }

  public async pauseQueue(type: string, modifier: string) {
    this.registry.markQueueAsPaused(type, modifier);

    if (this.registry.isQueueInProgress(type, modifier)) {
      return new Promise((resolve) => {
        this.registry.subscribeOnQueueDone(type, modifier, () => {
          resolve(true);
        });
      });
    }
  }

  public unpauseQueue(type: string, modifier: string) {
    this.registry.markQueueAsNotPaused(type, modifier);

    this.queue.runQueue(type, modifier);
  }

  private async getLastInProgressTask(type: string, modifier: string) {
    return this.queueRepository.findOneOrFail({
      where: { type, modifier, status: EQueueStatus.IN_PROGRESS },
      order: { createdDate: 'DESC' },
    });
  }
}
