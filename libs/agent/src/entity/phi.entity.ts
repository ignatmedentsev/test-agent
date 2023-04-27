import { Column, Entity, Index } from 'typeorm';

import { TDicomData } from '~common/types';
import { AbstractEntity } from '~core/db/abstract.entity'; // import from module causes loading LogService which throws an error

@Entity()
export class Phi extends AbstractEntity {
  @Column({ nullable: false })
  deviceId: number;

  @Index()
  @Column({ nullable: false, unique: true })
  sopInstanceUid: string;

  @Index()
  @Column({ nullable: false })
  studyInstanceUid: string;

  @Column({ nullable: false, type: 'simple-json' })
  dicomData: TDicomData;
}
