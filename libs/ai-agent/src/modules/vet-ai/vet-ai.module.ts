import { Module } from '@nestjs/common';

import { VetAiApiClientModule } from './vet-ai-api-client';
import { VetAiDicomGeneratorService } from './vet-ai-dicom-generator.service';
import { VetAiResultChecker } from './vet-ai-result.crone';
import { VetAiSenderService } from './vet-ai-sender.service';
import { VetAiService } from './vet-ai.service';

@Module({
  imports: [
    VetAiApiClientModule,
  ],
  providers: [
    VetAiService,
    VetAiResultChecker,
    VetAiSenderService,
    VetAiDicomGeneratorService,
  ],
  exports: [VetAiService, VetAiSenderService],
})
export class VetAiModule {}
