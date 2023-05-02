import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import stream from 'stream';
import util from 'util';

import { VetAiAnalysisRequest } from '~ai-agent/entity';
import { AiAgentPathService } from '~ai-agent/services';
import { EQueueType } from '~common/enums';
import type { IDataset, IDicomItem, IUids } from '~common/interfaces';
import type { TDeepPartial } from '~common/types';
import { NonTxDbService } from '~core/db';
import { LogService } from '~core/log';
import { QueueService } from '~core/queue';

import { VetAiApiClientService } from './vet-ai-api-client';
import { VetAiDicomGeneratorService } from './vet-ai-dicom-generator.service';
import { EVetAiAnalysisStatus } from './vet-ai-enums';
import type { IAnalysisRequestResult } from './vet-ai.interface';

const pipeline = util.promisify(stream.pipeline);

const CALLING_AET = 'VETAI-NANOX_AGENT';

@Injectable()
export class VetAiService {
  constructor(
    private readonly db: NonTxDbService,
    private readonly vetAiDicomGeneratorService: VetAiDicomGeneratorService,
    private readonly vetAiApiClientService: VetAiApiClientService,
    private readonly aiAgentPathService: AiAgentPathService,
    private readonly queueService: QueueService,
    private readonly logger: LogService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public async saveVetAiAnalysisRequest(analysisRequestResult: IAnalysisRequestResult, aiDispatchId: number, dataset: TDeepPartial<IDataset>) {
    await this.db.getRepository(VetAiAnalysisRequest).save({
      aiDispatchId,
      reqId: analysisRequestResult.rsltData.reqId,
      dataset,
    });

    this.logger.info(`Analysis request "${analysisRequestResult.rsltData.reqId}" for AI dispatch #${aiDispatchId} saved to DB`);
  }

  public async processVetAiAnalysisRequests() {
    const analysisRequests = await this.db.getRepository(VetAiAnalysisRequest).findBy({ analysisStatus: EVetAiAnalysisStatus.RUNNING });

    for (const analysisRequest of analysisRequests) {
      this.logger.debug(`Processing analysis request "${analysisRequest.reqId}"...`);

      const analysisResult = await this.vetAiApiClientService.getAnalysisResultV2(analysisRequest.reqId);

      switch (analysisResult.rsltData.analysisStts) {
        case EVetAiAnalysisStatus.SUCCESS:
          await this.processSuccessAnalysisRequests(analysisRequest);
          break;
        case EVetAiAnalysisStatus.FAIL:
          this.processFailedAnalysisRequests(analysisRequest);
          break;
        case EVetAiAnalysisStatus.RUNNING:
          this.logger.info(`Analysis request "${analysisRequest.reqId}" still running`);
          break;
        default:
          const nonExistingStatus: never = analysisResult.rsltData.analysisStts;
          throw new Error(`Analysis request "${analysisRequest.reqId}". Unknown analysis status: "${nonExistingStatus}"`);
      }

      await this.db.getRepository(VetAiAnalysisRequest).update(analysisRequest.id!, { analysisStatus: analysisResult.rsltData.analysisStts });
    }
  }

  private async processSuccessAnalysisRequests(analysisRequest: VetAiAnalysisRequest) {
    this.logger.info(`Analysis request "${analysisRequest.reqId}" is successful on VetAI side.`);

    this.logger.info(`Analysis request "${analysisRequest.reqId}". Downloading PDF report`);
    const datasetStream = await this.vetAiApiClientService.wholeAnalysisResultSearch(analysisRequest.reqId);

    const pdfFilePath = await this.writePdfFromStream(datasetStream, analysisRequest.reqId);
    this.logger.info(`Analysis request "${analysisRequest.reqId}". Pdf report downloaded to "${pdfFilePath}"`);

    const image = await this.vetAiDicomGeneratorService.pdfToImage(pdfFilePath);
    const imageBuffer = new Uint8Array(await image.jpeg({ quality: 100 }).toBuffer()).buffer;
    const imageMetedata = await image.metadata();
    this.logger.info(`Analysis request "${analysisRequest.reqId}". Image converted from PDF`);

    this.logger.info(`Analysis request "${analysisRequest.reqId}". Generating AI report`);
    const reportFilePath = await this.vetAiDicomGeneratorService.generateImageDicomReport(
      analysisRequest.reqId,
      analysisRequest.dataset,
      imageBuffer,
      { height: imageMetedata.height!, width: imageMetedata.width! },
    );
    this.logger.info(`Analysis request "${analysisRequest.reqId}". AI report generated to path: "${reportFilePath}"`);

    const uids = {
      seriesInstanceUID: analysisRequest.dataset.SeriesInstanceUID,
      sopInstanceUID: analysisRequest.dataset.SOPInstanceUID,
      studyInstanceUID: analysisRequest.dataset.StudyInstanceUID,
    } as IUids;

    const dicomItem = { dicomFilePath: reportFilePath, uids, callingAet: CALLING_AET } as IDicomItem;

    await this.queueService.addToQueue(this.db, EQueueType.DICOM_PROCESSOR, 'common', JSON.stringify(dicomItem));

    this.logger.info(`Analysis request "${analysisRequest.reqId}". PDF report queued for sending to platform`);
  }

  // TODO: Send notification to platform about failed analysis
  private processFailedAnalysisRequests(analysisRequest: VetAiAnalysisRequest) {
    this.logger.warn(`Analysis request "${analysisRequest.reqId}" is failed on VetAI side`);
  }

  // TODO: use this method to get analysis result for platform
  // private getAnalysisResult(analysisResult: IGetAnalysisResult) {
  //   if (!analysisResult.rsltData?.analysisRslt?.length || !analysisResult.rsltData?.analysisRslt[0]?.results) {
  //     return 'NOT_NORMAL';
  //   }

  //   for (const result of analysisResult.rsltData?.analysisRslt[0]?.results) {
  //     if (result.scores.findIndex((score) => score > 0.5) >= 0) {
  //       return 'NOT_NORMAL';
  //     }
  //   }

  //   return 'NORMAL';
  // }

  private async writePdfFromStream(readableStream: NodeJS.ReadableStream, reqId: string) {
    const receivedFilePath = path.join(this.aiAgentPathService.getPathToTemp(), `${reqId}.pdf`);
    const writeStream = fs.createWriteStream(receivedFilePath);
    await pipeline(readableStream, writeStream);

    return receivedFilePath;
  }
}
