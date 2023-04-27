/* eslint-disable @typescript-eslint/indent */

import type FormData from 'form-data';

import type { SubmitExamDto } from '~common/dto';
import type { EPlatformApiUrl, ETaskStatus, ETaskType } from '~common/enums';
import type { IPacsFileInfo } from '~common/interfaces';

import type { TTaskStatusResponsePayload } from './TNewTaskDescription';

export type TPlatformRequestApiPayload<T extends EPlatformApiUrl> =
  T extends EPlatformApiUrl.AGENT_AUTH ? { agentKey: string, agentUUID: string, version: string } :
  T extends EPlatformApiUrl.AGENT_TASK_GET_FILE ? { taskId: string } :
  T extends EPlatformApiUrl.AGENT_TASK_UPDATE_STATUS ? {
    taskId: string,
    status: ETaskStatus,
    type: ETaskType,
    payload: TTaskStatusResponsePayload<ETaskStatus, ETaskType> | undefined,
  } | FormData :
  T extends EPlatformApiUrl.EXAM_SUBMIT_WITHOUT_FORM_THROUGH_AGENT ? SubmitExamDto :
  T extends EPlatformApiUrl.GET_ORGANIZATION_INFO ? never :
  T extends EPlatformApiUrl.PACS_FILE_AGENT_PROCESS ? FormData :
  T extends EPlatformApiUrl.PACS_FILE_AGENT_SAVE ? IPacsFileInfo :
  T extends EPlatformApiUrl.SAVE_STUDY_NOTES_DICOM ? FormData :
  never;
