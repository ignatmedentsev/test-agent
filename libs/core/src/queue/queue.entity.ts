import { Column, Entity, Index } from 'typeorm';

import { AbstractEntity } from '~core/db/abstract.entity';

import { EQueuePriority, EQueueStatus } from './queue.enums';
import type { IQueue } from './queue.interface';

@Entity()
export class Queue extends AbstractEntity implements IQueue {
  @Index()
  @Column()
  type: string;

  @Index()
  @Column({ default: '' })
  modifier: string;

  @Column('text') // TODO: need for text column type
  payload: string;

  @Index()
  @Column({ default: EQueuePriority.NORMAL })
  priority: EQueuePriority;

  @Index()
  @Column({ default: '' })
  sort: string;

  @Index()
  @Column({ default: EQueueStatus.PENDING })
  status: EQueueStatus;

  @Column({ default: '' })
  error: string;

  @Column({ nullable: true })
  attempt: number;
}
