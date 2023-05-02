import type { ETaskType } from '~common/enums';
import type { TTaskPayloadType } from '~common/types';

export interface IDicomAiSender {
  sendDicomToAi: (filePath: string, payload: TTaskPayloadType<ETaskType.SEND_PLATFORM_DICOM>) => Promise<void>;
}
