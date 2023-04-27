import { ETaskType } from '~common/enums';
import type { TAgentTaskFunction, TTaskPayloadType } from '~common/types';
import type { ITask } from '~core/task';
import { Task } from '~core/task';

import { StudyNotesService } from './study-notes.service';

@Task(ETaskType.REQUEST_STUDY_NOTES)
export class RequestStudyNotesTask implements ITask<TAgentTaskFunction<ETaskType.REQUEST_STUDY_NOTES>> {
  constructor(
    private readonly studyNotesService: StudyNotesService,
  ) {}

  public async run(_: string, payload: TTaskPayloadType<ETaskType.REQUEST_STUDY_NOTES>) {
    return this.studyNotesService.requestStudyNotes(payload);
  }
}
