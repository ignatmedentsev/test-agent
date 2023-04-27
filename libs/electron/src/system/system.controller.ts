import { Body, Controller } from '@nestjs/common';
import { shell } from 'electron';

import { EAgentApiUrl } from '~common/enums';
import { Api } from '~core/api';

@Controller()
export class SystemController {
  @Api(EAgentApiUrl.OPEN_URL)
  public async openUrl(@Body('url') url: string) {
    await shell.openExternal(url);
  }
}
