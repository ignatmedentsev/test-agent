import { Injectable } from '@nestjs/common';

import type { SubmitExamDto } from '~common/dto';
import { EPlatformApiUrl } from '~common/enums';
import { PlatformApiClientService } from '~core/api-client';

@Injectable()
export class AgentApiClientService extends PlatformApiClientService {
  public async submitExamWithoutFormThroughAgent(exam: SubmitExamDto) {
    const res = await this.post(EPlatformApiUrl.EXAM_SUBMIT_WITHOUT_FORM_THROUGH_AGENT, exam);

    return res.data;
  }
}
