import { Module } from '@nestjs/common';

import { HttpsOnlyGuard } from './https-only.guard';

@Module({
  providers: [
    HttpsOnlyGuard,
  ],
  exports: [
    HttpsOnlyGuard,
  ],
})
export class HttpsModule {}
