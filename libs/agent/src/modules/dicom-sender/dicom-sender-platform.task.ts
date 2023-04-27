import { ETaskType } from '~common/enums';
import type { TTaskPayloadType, TAgentTaskFunction } from '~common/types';
import type { ITask } from '~core/task';
import { Task } from '~core/task';

import { DicomSenderService } from './dicom-sender.service';

@Task(ETaskType.SEND_PLATFORM_DICOM, { queue: true })
export class DicomSenderPlatformTask implements ITask<TAgentTaskFunction<ETaskType.SEND_PLATFORM_DICOM>> {
  constructor(
    private readonly dicomSenderService: DicomSenderService,
  ) {}

  public async run(taskId: string, payload: TTaskPayloadType<ETaskType.SEND_PLATFORM_DICOM>) {
    return this.dicomSenderService.sendDicomFromPlatform(taskId, payload);
  }
}
