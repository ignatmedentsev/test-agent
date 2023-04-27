import { ETaskType } from '~common/enums';
import type { TAgentTaskFunction, TTaskPayloadType } from '~common/types';
import type { ITask } from '~core/task';
import { Task } from '~core/task';

import { PhiService } from './phi.service';

@Task(ETaskType.UPDATE_PHI_DATA)
export class UpdatePhiDataTask implements ITask<TAgentTaskFunction<ETaskType.UPDATE_PHI_DATA>> {
  constructor(
    private readonly phiService: PhiService,
  ) {}

  public async run(_: string, payload: TTaskPayloadType<ETaskType.UPDATE_PHI_DATA>) {
    return this.phiService.updatePhiDataFromDicom(payload);
  }
}
