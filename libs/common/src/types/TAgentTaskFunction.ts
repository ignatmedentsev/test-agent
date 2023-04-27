/* eslint-disable @typescript-eslint/indent */

import type { ETaskType } from '~common/enums/task.enum';
import type { TTaskPayloadType, TTaskResponsePayloadType } from '~common/types/TNewTaskDescription';

export type TAgentTaskFunction<T extends ETaskType> = (taskId: string, payload: TTaskPayloadType<T>)
  => Promise<TTaskResponsePayloadType<T> | undefined>
