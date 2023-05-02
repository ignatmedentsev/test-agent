import fs from 'fs';

import { FileService } from '~ai-agent/modules/file';
import { VetAiSenderService } from '~ai-agent/modules/vet-ai';
import { AiAgentConfigService } from '~ai-agent/services';
import { EAiSendType, ETaskType } from '~common/enums';
import type { TTaskPayloadType, TAgentTaskFunction } from '~common/types';
import type { ITask } from '~core/task';
import { Task } from '~core/task';

import { DicomPushSenderService } from './dicom-push-sender.service';

@Task(ETaskType.SEND_PLATFORM_DICOM, { queue: true })
export class DicomAiSenderTask implements ITask<TAgentTaskFunction<ETaskType.SEND_PLATFORM_DICOM>> {
  constructor(
    private readonly dicomPushSenderService: DicomPushSenderService,
    private readonly vetAiSenderService: VetAiSenderService,
    private readonly fileService: FileService,
    private readonly configService: AiAgentConfigService,
  ) {}

  public async run(taskId: string, payload: TTaskPayloadType<ETaskType.SEND_PLATFORM_DICOM>) {
    const receivedFilePath = await this.fileService.downloadDicomFromPlatform(taskId, payload);

    try {
      const aiSender = this.getAiSender();

      await aiSender.sendDicomToAi(receivedFilePath, payload);
    } finally {
      if (fs.existsSync(receivedFilePath)) {
        await fs.promises.unlink(receivedFilePath);
      }
    }
  }

  private getAiSender() {
    const aiSendType = this.configService.getAiSendType();

    switch (aiSendType) {
      case EAiSendType.PUSH:
        return this.dicomPushSenderService;
      case EAiSendType.VET_AI_API:
        return this.vetAiSenderService;
      default:
        const nonExistingType: never = aiSendType;
        throw new Error(`Unknown AI sender type: "${nonExistingType}"`);
    }
  }
}
