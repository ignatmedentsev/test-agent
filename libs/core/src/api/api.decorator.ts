import { applyDecorators, RequestMethod, SetMetadata } from '@nestjs/common';

import { API_OPTIONS, API_URL, METHOD_METADATA, PATH_METADATA } from './api.constants';
import type { IApiOptions } from './api.interfaces';

/**
 * Creates a API options.
 *
 * @param url Url of the API endpoint.
 * @param options API options.
 */
export function Api<T>(
  url: T,
  options: IApiOptions = { method: RequestMethod.POST },
): MethodDecorator {
  return applyDecorators(
    SetMetadata(API_URL, url),
    SetMetadata(API_OPTIONS, options),
    SetMetadata(PATH_METADATA, url),
    SetMetadata(METHOD_METADATA, options.method),
  );
}
