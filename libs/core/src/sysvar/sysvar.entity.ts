import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SysVar<T extends string, K> {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ unique: true })
  name: T;

  @Column({ nullable: false, type: 'simple-json' })
  value: K;
}
