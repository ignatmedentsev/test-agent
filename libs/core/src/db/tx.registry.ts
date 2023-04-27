import { Injectable } from '@nestjs/common';
import type { QueryRunner } from 'typeorm';

@Injectable()
export class TxRegistry {
  private readonly map = new Map<string, QueryRunner>();

  public register(key: string, txQueryRunner: QueryRunner) {
    if (!txQueryRunner.isTransactionActive) {
      throw new Error(`Transaction is not started for key ${key}`);
    }

    this.map.set(key, txQueryRunner);
  }

  public getByKey(key: string) {
    return this.map.get(key);
  }

  public getMap() {
    return this.map;
  }

  public exists(key: string) {
    return this.map.has(key);
  }

  public delete(key: string) {
    this.map.delete(key);
  }
}
