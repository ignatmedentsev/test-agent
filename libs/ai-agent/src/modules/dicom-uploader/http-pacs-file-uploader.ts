import { Injectable } from '@nestjs/common';
import FormData from 'form-data';
import fs from 'fs';
import util from 'util';

import { AiAgentApiClientService } from '~ai-agent/modules/ai-agent-api-client';
import type { IDicomItem } from '~common/interfaces';
import { LogService } from '~core/log';

import type { IPacsFileUploader } from './dicom-uploader.interfaces';

@Injectable()
export class HttpPacsFileUploader implements IPacsFileUploader {
  constructor(
    private readonly aiAgentApiClientService: AiAgentApiClientService,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public async uploadPacsFile(item: IDicomItem) {
    const formData = new FormData();

    if (!item.dicomFilePath) {
      throw new Error(`Missing DICOM buffer for SOP Instance UID ${item.uids.sopInstanceUID}`);
    }

    if (!item.parsedDicom) {
      throw new Error('Missing DICOM parsed data');
    }
    formData.append('pacsFileInfo', JSON.stringify(item.parsedDicom));
    formData.append('dicom', fs.createReadStream(item.dicomFilePath));

    try {
      await this.aiAgentApiClientService.newPacsFileProcess(formData);
      this.logger.info(`DICOM with sopInstanceUID: "${item.uids.sopInstanceUID}" was successfully sent to platform`);
    } catch (error) {
      throw new Error(`Error occurred while sending to platform: ${util.inspect(error)}`);
    }
  }
}
