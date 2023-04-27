import { Injectable } from '@nestjs/common';
import util from 'util';

import { DicomSenderService } from '~agent/modules/dicom-sender';
import { AgentConfigService } from '~agent/services';
import { isHostname } from '~agent/utils/validators/isHostname';
import type { IDicomItem, IPacsServer } from '~common/interfaces';
import { ApiClientService } from '~core/api-client';
import { LogService } from '~core/log';

import type { IPacsFileUploader } from './dicom-uploader.interfaces';

@Injectable()
export class DimsePacsFileUploader implements IPacsFileUploader {
  constructor(
    private readonly apiClientService: ApiClientService,
    private readonly configService: AgentConfigService,
    private readonly dicomSender: DicomSenderService,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public async uploadPacsFile(item: IDicomItem, isPhiExists: boolean) {
    if (!item.dicomFilePath) {
      throw new Error(`Missing DICOM buffer for SOP Instance UID ${item.uids.sopInstanceUID}`);
    }

    if (!item.parsedDicom) {
      throw new Error('Missing DICOM parsed data');
    }

    const marketplacePublicPacs = this.configService.getMarketplacePublicPacs();
    this.verifyPacs(marketplacePublicPacs);

    try {
      const allowInsecure = this.configService.allowInsecureDimsePacsFileUpload();
      await this.apiClientService.newPacsFileSave({ ...item.parsedDicom, skipUpdateFilledPacsFiles: !isPhiExists });
      const dimseOptions = { allowInsecure, checkTls: true };
      await this.dicomSender.echo(marketplacePublicPacs, dimseOptions);
      await this.dicomSender.sendDicomFile(item.dicomFilePath, marketplacePublicPacs, dimseOptions);

      this.logger.info(`DICOM with sopInstanceUID: "${item.uids.sopInstanceUID}" was successfully sent to platform`);
    } catch (error) {
      throw new Error(`Error occurred while sending to platform: ${util.inspect(error)}`);
    }
  }

  private verifyPacs(marketplacePublicPacs: IPacsServer) {
    if (!marketplacePublicPacs) {
      throw new Error(`Marketplace public PACS server is empty`);
    }
    if (!marketplacePublicPacs.host) {
      throw new Error(`Marketplace public PACS server host is empty`);
    }
    if (!isHostname(marketplacePublicPacs.host)) {
      throw new Error(`Marketplace public PACS server host is not a valid domain name: ${marketplacePublicPacs.host}`);
    }
    if (!marketplacePublicPacs.port) {
      throw new Error(`Marketplace public PACS server port is empty`);
    }
    if (marketplacePublicPacs.port < 1 || marketplacePublicPacs.port > 65535) {
      throw new Error(`Marketplace public PACS server port is invalid: ${marketplacePublicPacs.port}`);
    }
    if (!marketplacePublicPacs.destinationAet) {
      throw new Error(`Marketplace public PACS server AET is empty`);
    }
  }
}
