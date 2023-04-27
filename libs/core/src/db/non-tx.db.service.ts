import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm'; // eslint-disable-line no-restricted-imports -- Allowed only here

@Injectable()
export class NonTxDbService extends EntityManager {}
