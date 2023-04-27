/* eslint-disable @typescript-eslint/indent */

import type { EPlatformApiUrl } from '~common/enums';
import type { IGetOrganizationInfo, IPlatformExternalApiError } from '~common/interfaces';

import type { TAgentAuthInfo } from './TAgentAuthInfo';

export type TPlatformApiResponse<T = EPlatformApiUrl> =
  T extends EPlatformApiUrl.AGENT_AUTH ? TAgentAuthInfo :
  T extends EPlatformApiUrl.GET_ORGANIZATION_INFO ? IGetOrganizationInfo :
  T extends EPlatformApiUrl.AGENT_TASK_UPDATE_STATUS ? void :
  T extends EPlatformApiUrl.AGENT_TASK_GET_FILE ? Blob :
  T extends EPlatformApiUrl.AGENT_TASK_UPDATE_STATUS ? void :
  T extends EPlatformApiUrl.EXAM_SUBMIT_WITHOUT_FORM_THROUGH_AGENT ? IPlatformExternalApiError | undefined :
  T extends EPlatformApiUrl.GET_ORGANIZATION_INFO ? IGetOrganizationInfo :
  T extends EPlatformApiUrl.PACS_FILE_AGENT_PROCESS ? void :
  T extends EPlatformApiUrl.PACS_FILE_AGENT_SAVE ? void :
  T extends EPlatformApiUrl.SAVE_STUDY_NOTES_DICOM ? void :
  never;
