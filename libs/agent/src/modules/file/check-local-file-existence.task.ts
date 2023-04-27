import { FileService } from '~agent/modules/file/file.service';
import { ETaskType } from '~common/enums';
import type { TAgentTaskFunction, TTaskPayloadType } from '~common/types';
import type { ITask } from '~core/task';
import { Task } from '~core/task';

@Task(ETaskType.CHECK_LOCAL_FILE_EXISTENCE)
export class CheckLocalFileExistenceTask implements ITask<TAgentTaskFunction<ETaskType.CHECK_LOCAL_FILE_EXISTENCE>> {
  constructor(
    private readonly fileService: FileService,
  ) {}

  public async run(_: string, payload: TTaskPayloadType<ETaskType.CHECK_LOCAL_FILE_EXISTENCE>) {
    return Promise.resolve(this.fileService.isLocalDicomFileExists(payload.studyInstanceUid, payload.sopInstanceUid));
  }
}
