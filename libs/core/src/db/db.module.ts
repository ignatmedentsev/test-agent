import { Global, Module, Scope } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm'; // eslint-disable-line no-restricted-imports -- Allowed only here

import { PathService } from '~agent/services';
import type { IRequest } from '~common/interfaces';
import { ApiModule } from '~core/api';
import { LogService } from '~core/log';

import { DbService } from './db.service';
import { NonTxDbService } from './non-tx.db.service';
import { TxInterceptor } from './tx.interceptor';
import { TxRegistry } from './tx.registry';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [],
      inject: [PathService],
      useFactory: (pathService: PathService) => {
        LogService.debug(`Database path ${pathService.getPathToDb()}`, 'DbModule');

        return {
          type: 'sqlite',
          database: pathService.getPathToDb(),
          entities: [pathService.getPathToDbEntities(), pathService.getPathToCoreDbEntities()],
          migrations: [pathService.getPathToDbMigrations(), pathService.getPathToCoreDbMigrations()],
          migrationsRun: process.env.NODE_ENV === 'dev' ? false : true,
          synchronize: false,
        };
      },
      dataSourceFactory: async (config) => {
        if (!config) {
          throw new Error('Config not found');
        }
        const dataSource = await new DataSource(config).initialize();
        LogService.log('Agent db initialized', 'DbModule');

        return dataSource;
      },
    }),
    ApiModule,
  ],
  providers: [
    {
      provide: NonTxDbService,
      useExisting: EntityManager,
    },
    {
      provide: DbService,
      scope: Scope.REQUEST,
      inject: ['REQUEST', NonTxDbService, TxRegistry],
      useFactory: (req: IRequest, nonTxDb: NonTxDbService, txRegistry: TxRegistry) => {
        const key = req?.transactionId;

        if (key && txRegistry.exists(key)) {
          return txRegistry.getByKey(key)?.manager;
        } else {
          return nonTxDb;
        }
      },
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TxInterceptor,
    },
    TxRegistry,
  ],
  exports: [NonTxDbService, DbService, TxRegistry],

})
export class DbModule {}
