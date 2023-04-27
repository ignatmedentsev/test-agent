import type { EDicomVr } from '~common/enums';
import type { TDicomData } from '~common/types';

export type IValueDicomElement = { Alphabetic: string } | { Phonetic: string } | {Ideographic: string };

type TValueItem = string | IValueDicomElement | null | TDicomData | Record <number, number>;

export interface IDicomAttributeJsonModel {
  vr: EDicomVr;
  Value: TValueItem[] | [TValueItem];
}
