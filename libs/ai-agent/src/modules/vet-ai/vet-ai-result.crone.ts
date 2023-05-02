import { CronExpression } from '@nestjs/schedule';

import { AiAgentConfigService } from '~ai-agent/services';
import { EAiSendType } from '~common/enums';
import type { CronInterface } from '~core/cron';
import { Cron } from '~core/cron';

import { VetAiService } from './vet-ai.service';

@Cron('VET_AI_RESULT_CHECKER', { time: CronExpression.EVERY_30_SECONDS, log: false, transaction: false })
export class VetAiResultChecker implements CronInterface {
  constructor(
    private readonly vetAiService: VetAiService,
    private readonly configService: AiAgentConfigService,
  ) {}

  public async run() {
    const aiSendType = this.configService.getAiSendType();

    if (aiSendType !== EAiSendType.VET_AI_API) {
      return;
    }

    await this.vetAiService.processVetAiAnalysisRequests();
  }
}
