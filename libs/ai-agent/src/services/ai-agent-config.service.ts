import { EAiSendType } from '~common/enums';
import type { IVetAiOptions } from '~common/interfaces/IVetAiConfig';
import { CoreConfigService } from '~core/services';

export abstract class AiAgentConfigService extends CoreConfigService {
  public getAiSendType(): EAiSendType {
    return this.configService.get<EAiSendType>('aiSendType') ?? EAiSendType.PUSH;
  }

  public getGhostScriptPath() {
    const ghostScriptPath = this.configService.get<string>('ghostScriptPath');
    if (!ghostScriptPath) {
      throw new Error(`GhostScriptPath is not specified in config`);
    }

    return ghostScriptPath;
  }

  public getVetAiOptions(): IVetAiOptions {
    return this.configService.get<IVetAiOptions>('vetAi', { infer: true });
  }
}
