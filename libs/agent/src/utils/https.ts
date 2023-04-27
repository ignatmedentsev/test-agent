
import type { THttpsOptions, TValidationResult } from '~common/types';

export function verifyHttpsOptions(options: THttpsOptions): TValidationResult {
  let result = { success: false, error: '' };

  if (!options) {
    result.error = 'no HTTPS options provided';

    return result;
  }
  if (!options.key) {
    result.error = 'HTTPS key is required';

    return result;
  }

  if (!options.cert) {
    result.error = `HTTPS certificate is required`;

    return result;
  }
  result.success = true;

  return result;
}
