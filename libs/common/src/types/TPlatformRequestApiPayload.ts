import type FormData from 'form-data';

import type { SubmitExamDto } from '~common/dto';
import type { EPlatformApiUrl } from '~common/enums';
import type { IPacsFileInfo } from '~common/interfaces';

export type TPlatformRequestApiPayload = {
  [EPlatformApiUrl.AGENT_AUTH]: { agentKey: string, agentUUID: string, version: string, os: string, mode: string },
  [EPlatformApiUrl.AGENT_TASK_GET_FILE]: { taskId: string },
  [EPlatformApiUrl.AGENT_TASK_UPDATE_STATUS]: FormData,
  [EPlatformApiUrl.EXAM_SUBMIT_WITHOUT_FORM_THROUGH_AGENT]: SubmitExamDto,
  [EPlatformApiUrl.GET_ORGANIZATION_INFO]: never,
  [EPlatformApiUrl.PACS_FILE_AGENT_PROCESS]: FormData,
  [EPlatformApiUrl.PACS_FILE_AGENT_SAVE]: IPacsFileInfo,
  [EPlatformApiUrl.SAVE_STUDY_NOTES_DICOM]: FormData,
}
