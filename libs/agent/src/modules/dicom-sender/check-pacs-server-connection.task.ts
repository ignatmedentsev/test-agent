import { ETaskType } from '~common/enums';
import type { IPacsServer } from '~common/interfaces';
import type { TAgentTaskFunction } from '~common/types';
import type { ITask } from '~core/task';
import { Task } from '~core/task';

import { DicomSenderService } from './dicom-sender.service';

@Task(ETaskType.CHECK_PACS_SERVER_CONNECTION)
export class CheckPacsServerConnectionTask implements ITask<TAgentTaskFunction<ETaskType.CHECK_PACS_SERVER_CONNECTION>> {
  constructor(
    private readonly dicomSender: DicomSenderService,
  ) {}

  public async run(_: string, pacsServer: IPacsServer) {
    return this.dicomSender.pingPacsServer(pacsServer);
  }
}
