
import { FileService } from '~ai-agent/modules/file';
import { AiAgentConfigService } from '~ai-agent/services';
import { EPacsFileUploaderType, EQueueType } from '~common/enums';
import type { IDicomItem } from '~common/interfaces';
import type { TAiDicomUploaderQueuePayload } from '~common/types';
import type { DbService } from '~core/db';
import { LogService } from '~core/log';
import type { QueueInterface } from '~core/queue';
import { Queue } from '~core/queue';

import { DimsePacsFileUploader } from './dimse-pacs-file-uploader';
import { HttpPacsFileUploader } from './http-pacs-file-uploader';

@Queue(EQueueType.DICOM_UPLOADER, { maxAttempts: 3, transaction: false, parallelThreads: 4, processingDelay: 300 })
export class DicomUploaderQueue implements QueueInterface {
  constructor(
    private readonly configService: AiAgentConfigService,
    private readonly dimsePacsFileUploader: DimsePacsFileUploader,
    private readonly fileService: FileService,
    private readonly httpPacsFileUploader: HttpPacsFileUploader,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public async processItem(_: DbService, payload: string) {
    const { item } = JSON.parse(payload) as TAiDicomUploaderQueuePayload;
    const uploader = this.getDicomUploader();
    await uploader.uploadPacsFile(item);
    await this.deleteLocalFile(item);

    this.logger.info(`DICOM with sopInstanceUID: "${item.uids.sopInstanceUID}" processed successfully`);
  }

  private getDicomUploader() {
    const uploaderType = this.configService.getPacsFileUploaderType();

    switch (uploaderType) {
      case EPacsFileUploaderType.DIMSE:
        return this.dimsePacsFileUploader;
      case EPacsFileUploaderType.HTTP:
        return this.httpPacsFileUploader;
      default:
        const nonExistingType: never = uploaderType;
        throw new Error(`Unknown PACS file uploader type: "${nonExistingType}"`);
    }
  }

  private async deleteLocalFile(item: IDicomItem) {
    if (!item.dicomFilePath) {
      this.logger.info(`DICOM with sopInstanceUID: "${item.uids.sopInstanceUID}" file does not exist locally`);

      return;
    }

    await this.fileService.deleteFileByPath(item.dicomFilePath);
    delete item.dicomFilePath;
    this.logger.info(`DICOM with sopInstanceUID: "${item.uids.sopInstanceUID}" successfully deleted from local directory`);
  }
}
