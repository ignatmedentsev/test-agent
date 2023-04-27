import { Controller, RequestMethod } from '@nestjs/common';

import { EAgentApiUrl } from '~common/enums';
import { Api } from '~core/api';

@Controller()
export class RootController {
  @Api(EAgentApiUrl.ROOT, { method: RequestMethod.GET })
  public root() {
    return 'ok';
  }
}
