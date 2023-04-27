import { ETaskType } from '~common/enums';
import type { TAgentTaskFunction, TTaskPayloadType } from '~common/types';
import type { ITask } from '~core/task';
import { Task } from '~core/task';

import { StudyNotesService } from './study-notes.service';

@Task(ETaskType.SEND_STUDY_NOTES)
export class SendStudyNotesTask implements ITask<TAgentTaskFunction<ETaskType.SEND_STUDY_NOTES>> {
  constructor(
    private readonly studyNotesService: StudyNotesService,
  ) {}

  public async run(_: string, payload: TTaskPayloadType<ETaskType.SEND_STUDY_NOTES>) {
    return this.studyNotesService.sendStudyNotes(payload);
  }
}
