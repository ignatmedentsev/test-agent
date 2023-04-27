import type { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SysVar } from './sysvar.entity';
import { SysVarRepository } from './sysvar.repository';
import { SysVarService } from './sysvar.service';

@Module({})
export class SysVarModule {
  public static forRoot(): DynamicModule {
    return {
      module: SysVarModule,
      imports: [
        TypeOrmModule.forFeature([SysVar]),
      ],
      providers: [
        SysVarService,
        SysVarRepository,
      ],
      exports: [SysVarService, TypeOrmModule],
    };
  }
}
