import type { TDicomAttributeValue } from '~common/types';

// TODO: The same util exists on platform. Keep it in sync
export function extractPersonName(data: TDicomAttributeValue) {
  let value = '';

  if (data.Value) {
    const valueType = typeof data.Value[0];
    switch (valueType) {
      case 'string': {
        value = data.Value[0];
        break;
      }
      case 'object': {
        value = data.Value[0]?.Alphabetic || data.Value[0]?.Ideographic || data.Value[0]?.Phonetic || '';
        break;
      }
    }
  }

  return value;
}
