import { Injectable } from '@nestjs/common';

import { PlatformApiClientService } from '~core/api-client';

@Injectable()
export class AiAgentApiClientService extends PlatformApiClientService {}
