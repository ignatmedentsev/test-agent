import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { NonTxDbService } from '~core/db';

import { Queue } from './queue.entity';
import { EQueuePriority, EQueueStatus } from './queue.enums';

@Injectable()
export class QueueRepository extends Repository<Queue> {
  // _ is a fix for DI and withRepository.
  constructor(_: NonTxDbService, entityManager: NonTxDbService) {
    super(Queue, entityManager);
  }

  public async getCurrentQueues() {
    const result = await this.createQueryBuilder('queue')
      .select('distinct type')
      .addSelect('modifier')
      .groupBy('type, modifier')
      .where('status = :status', { status: EQueueStatus.PENDING })
      .getRawMany();

    return result;
  }

  // TODO: use generators to avoid performance issues in big queues
  // TODO: process FAILED (do not forget to fix isQueueEmpty and getCurrentQueues!!!)
  public async getQueue(type: string, modifier?: string, limit?: number) {
    const query = this.createQueryBuilder('queue')
      .where('queue.type = :type', { type })
      .andWhere('queue.modifier = :modifier', { modifier })
      .andWhere('queue.status = :status', { status: EQueueStatus.PENDING })
      .orderBy('priority', 'DESC')
      .addOrderBy(`NULLIF(sort, '')`, 'ASC', 'NULLS LAST') // select rows with non-empty sort field first, all empty go afterwards
      .addOrderBy('id', 'ASC')
      .limit(limit);

    const result = await query.getMany();

    return result;
  }

  // TODO: process FAILED
  public async isQueueEmpty(type: string, modifier?: string): Promise<boolean> {
    const count = await this.countBy({
      type,
      modifier: modifier || '',
      status: EQueueStatus.PENDING,
    });

    return count === 0;
  }

  public async addToQueue(type: string, modifier: string, payload: string, priority = EQueuePriority.NORMAL, sort = '') {
    const result = await this.save({ type, modifier, payload, priority, sort });

    return result;
  }

  public async activateTasks() {
    await this.update({ status: EQueueStatus.DELAYED }, { status: EQueueStatus.PENDING });
  }

  public async startTask(queueItem: Queue) {
    queueItem.status = EQueueStatus.IN_PROGRESS;

    await this.save(queueItem);
  }

  public async delayTask(queueItem: Queue, error: string) {
    queueItem.status = EQueueStatus.DELAYED;
    queueItem.error = error;

    await this.save(queueItem);
  }

  public async removeFromQueue(id: number) {
    const queueItem = await this.findOneByOrFail({ id });
    await this.remove([queueItem]);
  }

  public async setErrorToQueue(queueItem: Queue, error: string) {
    queueItem.status = EQueueStatus.FAILED;
    queueItem.error = error;

    await this.save(queueItem);
  }
}
