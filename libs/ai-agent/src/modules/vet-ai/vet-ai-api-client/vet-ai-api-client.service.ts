import { Injectable } from '@nestjs/common';
import type { ReadStream } from 'fs';

import { AiAgentConfigService } from '~ai-agent/services';
import type { TApiDescription } from '~common/types';
import { ApiClientService } from '~core/api-client';
import { LogService } from '~core/log';

import type { EVetAiAnalysisModel } from '../vet-ai-enums';
import { EVetAiApiUrl } from '../vet-ai-enums';
import type { IAdditionalData } from '../vet-ai.interface';

import type { TVetAiApiResponse, TVetAiRequestApiPayload } from './vet-ai-api.type';
import { VetAiHttpService } from './vet-ai-http-service';

type TVetAiApiClientDescriptionMap = {
  [TUrl in EVetAiApiUrl]: TApiDescription<TUrl, TVetAiRequestApiPayload[TUrl], TVetAiApiResponse[TUrl]>
};

type TVetAiApiClientDescription<T extends EVetAiApiUrl> = T extends keyof TVetAiApiClientDescriptionMap
  ? TVetAiApiClientDescriptionMap[T]
  : never;

@Injectable()
export class VetAiApiClientService extends ApiClientService<TVetAiApiClientDescription<EVetAiApiUrl>> {
  constructor(
    private readonly configService: AiAgentConfigService,
    httpService: VetAiHttpService,
    logger: LogService,
  ) {
    super(httpService, logger);
    this.logger.setContext(this.constructor.name);
  }

  public async analysisRequest(additionalData: IAdditionalData, analysisModel: EVetAiAnalysisModel, fileStream: ReadStream) {
    const vetAiOptions = this.configService.getVetAiOptions();
    const res = await this.post(
      EVetAiApiUrl.ANALYSIS_REQUEST_V2,
      this.prepareFormData({
        files: fileStream,
        inference: {
          deviceId: vetAiOptions.deviceId,
          aiServiceId: vetAiOptions.aiServiceId,
          subsId: vetAiOptions.subscriptionId,
          analysisModel,
          additionalData,
        },
      }),
    );

    return res.data ;
  }

  public async getAnalysisResultV2(reqId: string) {
    const vetAiOptions = this.configService.getVetAiOptions();
    const res = await this.post(
      EVetAiApiUrl.GET_RESULTS_V2,
      {
        deviceId: vetAiOptions.deviceId,
        aiServiceId: vetAiOptions.aiServiceId,
        subsId: vetAiOptions.subscriptionId,
        reqId,
      },
    );

    return res.data ;
  }

  public async wholeAnalysisResultSearch(reqId: string) {
    const vetAiOptions = this.configService.getVetAiOptions();
    const res = await this.getStream(
      EVetAiApiUrl.GET_WHOLE_RESULTS,
      {
        deviceId: vetAiOptions.deviceId,
        aiServiceId: vetAiOptions.aiServiceId,
        subsId: vetAiOptions.subscriptionId,
        reqId,
      },
      'put',
    );

    return res.data ;
  }
}
