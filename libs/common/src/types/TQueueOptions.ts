
import type { EQueueType } from '~common/enums';
import type { IQueueProcessorOptions } from '~common/interfaces';

export type TQueueOptions = Partial<Record<EQueueType, IQueueProcessorOptions>>;
