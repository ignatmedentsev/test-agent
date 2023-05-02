import { Column, Entity, Index } from 'typeorm';

import { EVetAiAnalysisStatus } from '~ai-agent/modules/vet-ai/vet-ai-enums';
import type { IDataset } from '~common/interfaces';
import { TDeepPartial } from '~common/types';
import { AbstractEntity } from '~core/db/abstract.entity'; // import from module causes loading LogService which throws an error

@Entity()
export class VetAiAnalysisRequest extends AbstractEntity {
  @Index()
  @Column({ nullable: false, unique: true })
  reqId: string;

  @Column({ nullable: false, default: EVetAiAnalysisStatus.RUNNING })
  analysisStatus: string;

  @Column({ nullable: false })
  aiDispatchId: number;

  @Column({ nullable: false, type: 'simple-json' })
  dataset: TDeepPartial<IDataset>;
}
