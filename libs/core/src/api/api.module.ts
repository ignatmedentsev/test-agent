import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { ApiExplorer } from './api.explorer';
import { ApiRegistry } from './api.registry';

@Global()
@Module({
  imports: [
    DiscoveryModule,
  ],
  providers: [
    ApiRegistry,
    ApiExplorer,
  ],
  exports: [ApiRegistry],
})
export class ApiModule { }
