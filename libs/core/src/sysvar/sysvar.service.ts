import { Injectable } from '@nestjs/common';

import type { TSysVarType } from '~common/types';
import { getConfig } from '~common/utils/sysVars/utils';
import { LogService } from '~core/log';

import { SYS_VAR_RAW_TO_TYPE_FUNCTIONS } from './sysvar.const';
import { SysVarRepository } from './sysvar.repository';

@Injectable()
export class SysVarService {
  constructor(
    private readonly logger: LogService,
    private readonly sysVarRepository: SysVarRepository,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public async set<T extends string, K extends TSysVarType<T>>(name: T, value: K) {
    await this.sysVarRepository.set(name, value);
  }

  public async get<T extends string, K extends TSysVarType<T>>(name: T): Promise<K> {
    return this.sysVarRepository.get(name);
  }

  public async getRawValue(name: string) {
    return this.sysVarRepository.getRawValue(name);
  }

  public async saveRawValue(name: string, rawValue: string) {
    await this.sysVarRepository.saveRawValue(name, rawValue);
  }

  public getType(name: string) {
    return getConfig(name).type;
  }

  public parseRawValue<T extends string, K extends TSysVarType<T>>(name: T, rawValue: string): K {
    const type = this.getType(name);

    return SYS_VAR_RAW_TO_TYPE_FUNCTIONS[type](rawValue);
  }

  public getValidators(name: string) {
    return getConfig(name).validators;
  }

  public getName(name: string) {
    return getConfig(name).name;
  }

  public isEmptyAllowed(name: string) {
    return getConfig(name).allowEmpty;
  }

  public async findByIdOrFail(id: number) {
    return this.sysVarRepository.findOneByOrFail({ id });
  }
}
