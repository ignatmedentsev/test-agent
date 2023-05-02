import { CoreConfigService } from '~core/services';

export abstract class DesktopAgentConfigService extends CoreConfigService {
  public getAutoUpdateOption() {
    return this.configService.get<boolean>('autoUpdate') ?? true;
  }
}
