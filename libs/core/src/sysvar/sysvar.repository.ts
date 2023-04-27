import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm'; // eslint-disable-line no-restricted-imports -- TODO: MDW-3814 replace with NonTxDbService

import type { TSysVarType } from '~common/types';
import { getConfig } from '~common/utils/sysVars/utils';

import { SYS_VAR_RAW_TO_TYPE_FUNCTIONS, SYS_VAR_TYPE_TO_RAW_FUNCTIONS } from './sysvar.const';
import { SysVar } from './sysvar.entity';

@Injectable()
export class SysVarRepository extends Repository<SysVar<string, string>> {
  constructor(_: EntityManager, entityManager: EntityManager) {
    super(SysVar, entityManager);
  }

  public async get<T extends string, K extends TSysVarType<T>>(name: T): Promise<K> {
    if (!name) {
      throw new Error(`System variable name is empty`);
    }
    const type = getConfig(name).type;
    const rawValue = await this.getRawValue(name);

    if (!rawValue) {
      return undefined as unknown as K;
    }

    return SYS_VAR_RAW_TO_TYPE_FUNCTIONS[type](rawValue) as K;
  }

  async set<T extends string, K extends TSysVarType<T>>(name: T, value: K) {
    if (!name) {
      throw new Error('System variable name is empty');
    }

    if (!value) {
      throw new Error(`Value of system variable "${name}" is empty`);
    }
    const type = getConfig(name).type;
    const rawValue = SYS_VAR_TYPE_TO_RAW_FUNCTIONS[type](value);
    await this.saveRawValue(name, rawValue);
  }

  async getRawValue(name: string) {
    return (await this.findOneBy({ name }))?.value ?? getConfig(name).defaultRawValue;
  }

  async saveRawValue(name: string, rawValue: string) {
    if (!name) {
      throw new Error(`System variable name is empty`);
    }

    if (rawValue === undefined || rawValue === null) {
      throw new Error(`Raw value of system variable "${name}" is empty`);
    }
    const sysVar = await this.findOneBy({ name }) ?? this.create({ name });

    sysVar.value = rawValue;
    await this.save(sysVar);
  }
}
