/* eslint-disable @typescript-eslint/indent */

import type { EPlatformApiUrl } from '~common/enums';
import type { IGetOrganizationInfo, IPlatformExternalApiError } from '~common/interfaces';

import type { TAgentAuthInfo } from './TAgentAuthInfo';

export type TPlatformApiResponse = {
  [EPlatformApiUrl.AGENT_AUTH]: TAgentAuthInfo,
  [EPlatformApiUrl.AGENT_TASK_GET_FILE]: NodeJS.ReadableStream,
  [EPlatformApiUrl.AGENT_TASK_UPDATE_STATUS]: void,
  [EPlatformApiUrl.EXAM_SUBMIT_WITHOUT_FORM_THROUGH_AGENT]: IPlatformExternalApiError | undefined,
  [EPlatformApiUrl.GET_ORGANIZATION_INFO]: IGetOrganizationInfo,
  [EPlatformApiUrl.PACS_FILE_AGENT_PROCESS]: void,
  [EPlatformApiUrl.PACS_FILE_AGENT_SAVE]: void,
  [EPlatformApiUrl.SAVE_STUDY_NOTES_DICOM]: void,
}
