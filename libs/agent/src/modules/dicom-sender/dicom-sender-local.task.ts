import { ETaskType } from '~common/enums';
import type { TTaskPayloadType } from '~common/types';
import type { TAgentTaskFunction } from '~common/types/TAgentTaskFunction';
import type { ITask } from '~core/task';
import { Task } from '~core/task';

import { DicomSenderService } from './dicom-sender.service';

@Task(ETaskType.SEND_LOCAL_DICOM, { queue: true })
export class DicomSenderLocalTask implements ITask<TAgentTaskFunction<ETaskType.SEND_LOCAL_DICOM>> {
  constructor(
    private readonly dicomSenderService: DicomSenderService,
  ) {}

  public async run(_: string, payload: TTaskPayloadType<ETaskType.SEND_LOCAL_DICOM>) {
    return this.dicomSenderService.sendDicomFromLocal(payload);
  }
}
