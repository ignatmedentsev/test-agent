import type { EDicomVr } from '~common/enums';

export type TDicomAttributeValue = {
  Value: readonly [any?],
  vr: EDicomVr,
};
