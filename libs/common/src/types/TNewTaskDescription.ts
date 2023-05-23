/* eslint-disable @typescript-eslint/indent */

import type { PhiPlatformDto } from '~common/dto';
import type { ETaskStatus, ETaskType } from '~common/enums/task.enum';
import type { IPacsServer } from '~common/interfaces';

import type { TCheckLocalFileExistenceTaskPayload } from './TCheckLocalFileExistenceTaskPayload';
import type { TPingResponse } from './TPingResponse';
import type { TRequestPhiPayload } from './TRequestPhiPayload';
import type { TRequestStudyNotesPayload } from './TRequestStudyNotesPayload';
import type { TSendPlatformDicomPayload, TSendLocalDicomPayload } from './TSendDicomPayload';
import type { TSendStudyNotesPayload } from './TSendStudyNotesPayload';
import type { TStudyNotes } from './TStudyNotes';
import type { TUpdatePhiDataPayload } from './TUpdatePhiDataPayload';

export type TTaskPayloadType<T = ETaskType> =
  T extends ETaskType.CHECK_LOCAL_FILE_EXISTENCE ? TCheckLocalFileExistenceTaskPayload :
  T extends ETaskType.CHECK_PACS_SERVER_CONNECTION ? IPacsServer :
  T extends ETaskType.REQUEST_PHI ? TRequestPhiPayload :
  T extends ETaskType.UPDATE_PHI_DATA ? TUpdatePhiDataPayload :
  T extends ETaskType.REQUEST_STUDY_NOTES ? TRequestStudyNotesPayload :
  T extends ETaskType.SEND_LOCAL_DICOM ? TSendLocalDicomPayload :
  T extends ETaskType.SEND_STUDY_NOTES ? TSendStudyNotesPayload :
  T extends ETaskType.SEND_PLATFORM_DICOM ? TSendPlatformDicomPayload :
never

export type TNewTaskDescription<Type extends string, Payload> = {
  type: Type,
  payload: Payload,
  taskId: string,
}

export type TTaskStatusResponsePayload<T = ETaskStatus, T1 = ETaskType> =
  T extends ETaskStatus.ERROR ? string :
  T extends ETaskStatus.SUCCESS ? TTaskResponsePayloadType<T1> :
never

export type TTaskResponsePayloadType<T = ETaskType> =
  T extends ETaskType.CHECK_LOCAL_FILE_EXISTENCE ? boolean :
  T extends ETaskType.CHECK_PACS_SERVER_CONNECTION ? TPingResponse :
  T extends ETaskType.REQUEST_PHI ? PhiPlatformDto[] :
  T extends ETaskType.UPDATE_PHI_DATA ? void :
  T extends ETaskType.REQUEST_STUDY_NOTES ? TStudyNotes :
  T extends ETaskType.SEND_PLATFORM_DICOM ? void :
  T extends ETaskType.SEND_LOCAL_DICOM ? void :
  T extends ETaskType.SEND_STUDY_NOTES ? void :
never

