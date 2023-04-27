import { ETaskType } from '~common/enums';
import type { TAgentTaskFunction, TTaskPayloadType } from '~common/types';
import type { ITask } from '~core/task';
import { Task } from '~core/task';

import { PhiService } from './phi.service';

@Task(ETaskType.REQUEST_PHI)
export class RequestPhiTask implements ITask<TAgentTaskFunction<ETaskType.REQUEST_PHI>> {
  constructor(
    private readonly phiService: PhiService,
  ) {}

  public async run(_: string, payload: TTaskPayloadType<ETaskType.REQUEST_PHI>) {
    return this.phiService.sendPhiToPlatform(payload);
  }
}
