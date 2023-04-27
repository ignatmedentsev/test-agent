import { Module } from '@nestjs/common';

import { ApiClientModule } from '~core/api-client';
import { LogModule } from '~core/log';

import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [
    ApiClientModule,
    LogModule,
  ],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
  ],
  exports: [
    OrganizationService,
  ],
})
export class OrganizationModule { }
