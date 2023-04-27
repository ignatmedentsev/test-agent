import type { EDicomTag } from '~common/enums';
import type { TDicomData } from '~common/types';

export function getStringValue(dicomData: TDicomData | undefined, tag: EDicomTag) {
  return dicomData
      && dicomData[tag]
      && dicomData[tag]?.Value
      && dicomData[tag]?.Value.length
    ? dicomData[tag]?.Value[0] as string
    : '';
}

export function getStringValueFromSequence(dicomData: TDicomData | undefined, sequenceTag: EDicomTag, elementNumber: number, tag: EDicomTag) {
  return dicomData
    && (dicomData[sequenceTag])?.Value
    && (dicomData[sequenceTag])?.Value.length
    && (dicomData[sequenceTag])?.Value.length! >= elementNumber
    && ((dicomData[sequenceTag])?.Value[elementNumber] as TDicomData)?.[tag]
    && ((dicomData[sequenceTag])?.Value[elementNumber] as TDicomData)?.[tag]?.Value
    && ((dicomData[sequenceTag])?.Value[elementNumber] as TDicomData)?.[tag]?.Value[0]
    ? ((dicomData[sequenceTag])?.Value[elementNumber] as TDicomData)?.[tag]?.Value[0] as string
    : '';
}
