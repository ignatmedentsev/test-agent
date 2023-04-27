import { applyDecorators, SetMetadata } from '@nestjs/common';

import { TASK_NAME, TASK_OPTIONS } from './task.constants';
import type { ITaskOptions } from './task.interfaces';

export function Task<T>(
  name: T,
  options: ITaskOptions = {},
): ClassDecorator {
  return applyDecorators(
    SetMetadata(TASK_NAME, name),
    SetMetadata(TASK_OPTIONS, options),
  );
}
