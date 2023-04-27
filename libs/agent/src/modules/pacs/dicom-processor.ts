
import { FileService } from '~agent/modules/file';
import { OrganizationService } from '~agent/modules/organization';
import { PhiService } from '~agent/modules/phi';
import { EQueueType } from '~common/enums';
import type { IDicomItem } from '~common/interfaces';
import type { TDicomUploaderQueuePayload, TUpdatePhiDataPayload } from '~common/types';
import type { DbService } from '~core/db';
import { LogService } from '~core/log';
import type { QueueInterface } from '~core/queue';
import { Queue, QueueService } from '~core/queue';

import { ParseDicomService } from './parse-dicom.service';

@Queue(EQueueType.DICOM_PROCESSOR, { maxAttempts: 3, transaction: false, parallelThreads: 4 })

export class DicomProcessorQueue implements QueueInterface {
  constructor(
    private readonly fileService: FileService,
    private readonly organizationService: OrganizationService,
    private readonly parseDicomService: ParseDicomService,
    private readonly phiService: PhiService,
    private readonly queueService: QueueService,
    private logger: LogService,

  ) {
    logger.setContext(this.constructor.name);
  }

  public async processItem(db: DbService, payload: string) {
    const item = JSON.parse(payload) as IDicomItem;
    this.logger.info(`DICOM with sopInstanceUID: "${item.uids.sopInstanceUID}" start processing`);

    await this.getDicomBuffer(item);
    this.parseDicom(item);

    const isPhiExists = await this.phiService.checkPhiExistence(item.uids.sopInstanceUID);

    if (isPhiExists && this.organizationService.isMedcloudInternal() && item.parsedDicom) {
      const dicomInfo = {
        bodyPart: item.parsedDicom.bodyPart,
        pacsFiles: [{
          sopInstanceUid: item.parsedDicom.sopUid,
          modalityCode: item.parsedDicom.modality,
          seriesNumber: item.parsedDicom.seriesNo,
        }],
      } as TUpdatePhiDataPayload;
      await this.phiService.updatePhiDataFromDicom(dicomInfo);
    }

    delete item.dicomBuffer;
    const uploaderPayload: TDicomUploaderQueuePayload = { item, isPhiExists };
    await this.queueService.addToQueue(db, EQueueType.DICOM_UPLOADER, 'common', JSON.stringify(uploaderPayload));
  }

  private async getDicomBuffer(item: IDicomItem) {
    if (!item.dicomFilePath) {
      throw new Error('DICOM Item does not have a path to the DICOM file, so the buffer cannot be obtained');
    }

    item.dicomBuffer = await this.fileService.getBufferFromFile(item.dicomFilePath);
    this.logger.info(`DICOM with sopInstanceUID: "${item.uids.sopInstanceUID}" successfully get buffer from local path: "${item.dicomFilePath}"`);
  }

  private parseDicom(item: IDicomItem) {
    if (item.parsedDicom) {
      this.logger.info(`DICOM with sopInstanceUID: "${item.uids.sopInstanceUID}" already parsed`);

      return;
    }

    item.parsedDicom = this.parseDicomService.parseDicom(item);
    this.logger.info(`DICOM with sopInstanceUID: "${item.uids.sopInstanceUID}" successfully parsed`);
  }
}
