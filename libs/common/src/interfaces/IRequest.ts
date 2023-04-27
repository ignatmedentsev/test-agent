import type { Response } from 'express';

// TODO: remove after refactoring all old-style APIs
export interface IRequest<Body = any> {
  body: Body;
  query: any;
  params: any;

  isMobileApp?: boolean;

  transactionId?: string;

  /** @deprecated Better use Nest controller instead of old-fashioned APIs */
  files: any[]; // TODO: remove after refactoring all old upload APIs

  /** @deprecated Better use Nest controller instead of old-fashioned APIs */
  response?: Response; // TODO: remove after refactoring all old download APIs (and verify)
}
